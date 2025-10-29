'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/apiClient';
import { Edit, Heart, Package, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

interface StoreProduct {
  id: string;
  cjProductId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string | string[];
  category?: string;
  status: string;
  isFavorite?: boolean;
  // Champs détaillés
  productSku?: string;
  productWeight?: string;
  packingWeight?: string;
  productType?: string;
  productUnit?: string;
  dimensions?: string;
  materialNameEn?: string;
  packingNameEn?: string;
  suggestSellPrice?: string;
  brand?: string;
  tags?: string;
  supplierName?: string;
  listedNum?: number;
  variants?: string;
  reviews?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: StoreProduct;
  storeId: string;
  onSave: () => void;
}

export default function ProductEditModal({ isOpen, onClose, product, storeId, onSave }: ProductEditModalProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StoreProduct>(product);

  // Réinitialiser le formulaire quand le produit change
  useEffect(() => {
    setFormData(product);
  }, [product]);

  // Fonction utilitaire pour nettoyer les URLs d'images
  const getCleanImageUrl = (image: string | string[] | undefined): string | null => {
    if (!image) return null;
    
    try {
      if (Array.isArray(image)) {
        return image.length > 0 ? image[0] : null;
      }
      
      if (typeof image === 'string') {
        if (image.startsWith('[') && image.endsWith(']')) {
          const parsed = JSON.parse(image);
          return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
        }
        return image;
      }
    } catch (error) {
      console.warn('Erreur parsing image:', error);
    }
    
    return null;
  };

  // Parser les tags depuis la chaîne JSON
  const parseTagsFromString = (tagsString?: string): string[] => {
    if (!tagsString) return [];
    try {
      const parsed = JSON.parse(tagsString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Convertir les tags en chaîne JSON
  const stringifyTags = (tags: string[]): string => {
    return JSON.stringify(tags);
  };

  // Gérer les changements de champs
  const handleFieldChange = (field: keyof StoreProduct, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer les tags
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setCurrentTags(parseTagsFromString(formData.tags));
  }, [formData.tags]);

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      const updatedTags = [...currentTags, newTag.trim()];
      setCurrentTags(updatedTags);
      handleFieldChange('tags', stringifyTags(updatedTags));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentTags(updatedTags);
    handleFieldChange('tags', stringifyTags(updatedTags));
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient(`/stores/${storeId}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      toast.showToast({
        type: 'success',
        title: 'Produit modifié',
        description: 'Les modifications ont été sauvegardées avec succès',
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.showToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de sauvegarder les modifications',
      });
    } finally {
      setSaving(false);
    }
  };

  const productImage = getCleanImageUrl(formData.image);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier le produit
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de ce produit dans votre magasin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aperçu du produit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {productImage && (
                  <img
                    src={productImage}
                    alt={formData.name}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{formData.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.status === 'available' ? 'default' : 
                                  formData.status === 'selected' ? 'secondary' : 'outline'}>
                      {formData.status}
                    </Badge>
                    {formData.isFavorite && (
                      <Badge variant="outline" className="text-red-500">
                        <Heart className="h-3 w-3 mr-1" />
                        Favori
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Prix: ${formData.price}</span>
                    {formData.originalPrice && (
                      <span className="line-through">${formData.originalPrice}</span>
                    )}
                    {formData.category && <span>Catégorie: {formData.category}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire d'édition avec onglets */}
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="pricing">Tarification</TabsTrigger>
              <TabsTrigger value="specs">Spécifications</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="advanced">Avancé</TabsTrigger>
            </TabsList>

            {/* Onglet Général */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Nom du produit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    placeholder="Catégorie du produit"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Description détaillée du produit"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleFieldChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="selected">Sélectionné</SelectItem>
                      <SelectItem value="imported">Importé</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="favorite"
                    checked={formData.isFavorite || false}
                    onCheckedChange={(checked) => handleFieldChange('isFavorite', checked)}
                  />
                  <Label htmlFor="favorite">Marquer comme favori</Label>
                </div>
              </div>
            </TabsContent>

            {/* Onglet Tarification */}
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix de vente *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Prix original</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice || ''}
                    onChange={(e) => handleFieldChange('originalPrice', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suggestSellPrice">Prix suggéré CJ</Label>
                  <Input
                    id="suggestSellPrice"
                    value={formData.suggestSellPrice || ''}
                    onChange={(e) => handleFieldChange('suggestSellPrice', e.target.value)}
                    placeholder="Prix recommandé"
                  />
                </div>
              </div>

              {/* Indicateurs de marge */}
              {formData.originalPrice && formData.price && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Marge bénéficiaire:</span>
                      <span className={`font-semibold ${formData.price > formData.originalPrice ? 'text-green-600' : 'text-red-600'}`}>
                        {((formData.price - formData.originalPrice) / formData.originalPrice * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Spécifications */}
            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productSku">SKU</Label>
                  <Input
                    id="productSku"
                    value={formData.productSku || ''}
                    onChange={(e) => handleFieldChange('productSku', e.target.value)}
                    placeholder="Référence produit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productWeight">Poids produit</Label>
                  <Input
                    id="productWeight"
                    value={formData.productWeight || ''}
                    onChange={(e) => handleFieldChange('productWeight', e.target.value)}
                    placeholder="ex: 0.5kg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packingWeight">Poids emballage</Label>
                  <Input
                    id="packingWeight"
                    value={formData.packingWeight || ''}
                    onChange={(e) => handleFieldChange('packingWeight', e.target.value)}
                    placeholder="ex: 0.7kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions || ''}
                    onChange={(e) => handleFieldChange('dimensions', e.target.value)}
                    placeholder="ex: 20x15x10cm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Type de produit</Label>
                  <Input
                    id="productType"
                    value={formData.productType || ''}
                    onChange={(e) => handleFieldChange('productType', e.target.value)}
                    placeholder="Type ou catégorie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productUnit">Unité</Label>
                  <Input
                    id="productUnit"
                    value={formData.productUnit || ''}
                    onChange={(e) => handleFieldChange('productUnit', e.target.value)}
                    placeholder="pièce, lot, kg..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materialNameEn">Matériau</Label>
                  <Input
                    id="materialNameEn"
                    value={formData.materialNameEn || ''}
                    onChange={(e) => handleFieldChange('materialNameEn', e.target.value)}
                    placeholder="Composition du produit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packingNameEn">Type d'emballage</Label>
                  <Input
                    id="packingNameEn"
                    value={formData.packingNameEn || ''}
                    onChange={(e) => handleFieldChange('packingNameEn', e.target.value)}
                    placeholder="Description emballage"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Onglet Marketing */}
            <TabsContent value="marketing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => handleFieldChange('brand', e.target.value)}
                    placeholder="Nom de la marque"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Fournisseur</Label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName || ''}
                    onChange={(e) => handleFieldChange('supplierName', e.target.value)}
                    placeholder="Nom du fournisseur"
                  />
                </div>
              </div>

              {/* Gestion des tags */}
              <div className="space-y-2">
                <Label>Tags marketing</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ajouter un tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="listedNum">Quantité listée</Label>
                <Input
                  id="listedNum"
                  type="number"
                  min="0"
                  value={formData.listedNum || ''}
                  onChange={(e) => handleFieldChange('listedNum', parseInt(e.target.value) || undefined)}
                  placeholder="Quantité disponible"
                />
              </div>
            </TabsContent>

            {/* Onglet Avancé */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ID CJ Produit</Label>
                  <Input value={formData.cjProductId} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Identifiant unique CJ - Non modifiable
                  </p>
                </div>

                {formData.variants && (
                  <div className="space-y-2">
                    <Label>Variantes (JSON)</Label>
                    <Textarea
                      value={formData.variants}
                      onChange={(e) => handleFieldChange('variants', e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder='{"variants": []}'
                    />
                    <p className="text-xs text-muted-foreground">
                      Format JSON des variantes du produit
                    </p>
                  </div>
                )}

                {formData.reviews && (
                  <div className="space-y-2">
                    <Label>Avis clients (JSON)</Label>
                    <Textarea
                      value={formData.reviews}
                      onChange={(e) => handleFieldChange('reviews', e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder='{"reviews": []}'
                    />
                    <p className="text-xs text-muted-foreground">
                      Format JSON des avis clients
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Créé le:</strong> {new Date(formData.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Modifié le:</strong> {new Date(formData.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}