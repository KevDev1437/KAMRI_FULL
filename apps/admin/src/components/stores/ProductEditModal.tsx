'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/apiClient';
import { DollarSign, Edit, Heart, Package, Ruler, Save, Settings, Tag, X } from 'lucide-react';
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
  const [origDescriptionHtml, setOrigDescriptionHtml] = useState<string | undefined>(product.description);

  useEffect(() => {
    const imgsFromDesc = extractImageUrlsFromDescription(product.description);
    const imgsFromField: string[] = [];
    try {
      if (product.image) {
        if (Array.isArray(product.image)) imgsFromField.push(...product.image as string[]);
        else if (typeof product.image === 'string') {
          const s = product.image.trim();
          if (s.startsWith('[') && s.endsWith(']')) {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) imgsFromField.push(...parsed);
          } else {
            imgsFromField.push(s);
          }
        }
      }
    } catch (e) {
      // ignore
    }

    const mergedImages = Array.from(new Set([...imgsFromField, ...imgsFromDesc].filter(Boolean)));

    const removeImageTags = (html?: string) => {
      if (!html) return html || '';
      return html.replace(/<img[^>]*>/gi, '');
    };

    const stripHtmlTags = (html?: string) => {
      if (!html) return '';
      const withoutImgs = removeImageTags(html);
      const stripped = withoutImgs.replace(/<[^>]+>/g, '');
      return stripped.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    };

    setOrigDescriptionHtml(product.description);

    setFormData({
      ...product,
      description: stripHtmlTags(product.description),
      image: mergedImages.length > 0 ? mergedImages : product.image,
    });
  }, [product]);

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

  const parseTagsFromString = (tagsString?: string): string[] => {
    if (!tagsString) return [];
    try {
      const parsed = JSON.parse(tagsString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const stringifyTags = (tags: string[]): string => {
    return JSON.stringify(tags);
  };

  const handleFieldChange = (field: keyof StoreProduct, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const extractImageUrlsFromDescription = (desc?: string): string[] => {
    if (!desc) return [];
    const urls: string[] = [];
    try {
      const regex = /<img[^>]+src=["']?([^\s"'>]+)["']?/gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(desc)) !== null) {
        if (match[1]) urls.push(match[1]);
      }
    } catch (e) {
      // ignore
    }
    return urls;
  };

  const getAllImages = (): string[] => {
    const imgs: string[] = [];
    try {
      if (formData.image) {
        if (Array.isArray(formData.image)) imgs.push(...formData.image as string[]);
        else if (typeof formData.image === 'string') {
          const s = formData.image.trim();
          if (s.startsWith('[') && s.endsWith(']')) {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) imgs.push(...parsed);
          } else {
            imgs.push(s);
          }
        }
      }
    } catch (e) {
      // ignore parsing errors
    }

    imgs.push(...extractImageUrlsFromDescription(formData.description));

    return Array.from(new Set(imgs.filter(Boolean)));
  };

  const allImages = getAllImages();

  const sanitizeHTML = (html = ''): string => {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+=["'][\s\S]*?["']/gi, '')
      .replace(/javascript:\/\//gi, '')
      .replace(/javascript:/gi, '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            Modifier le produit
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Personnalisez les informations de ce produit dans votre magasin
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-6 space-y-6">
          {/* Aperçu du produit */}
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Aperçu du produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {allImages && allImages.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative group">
                        <img
                          src={allImages[0]}
                          alt={formData.name}
                          className="w-48 h-48 object-cover rounded-xl border-2 border-border shadow-md group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {allImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {allImages.slice(1, 5).map((src, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={src}
                                alt={`${formData.name} ${idx + 2}`}
                                className="w-full aspect-square object-cover rounded-lg border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    productImage && (
                      <img
                        src={productImage}
                        alt={formData.name}
                        className="w-48 h-48 object-cover rounded-xl border-2 border-border shadow-md hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-foreground leading-tight">{formData.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge 
                        variant={formData.status === 'available' ? 'default' : 
                                formData.status === 'selected' ? 'secondary' : 'outline'}
                        className="px-3 py-1 text-sm font-medium shadow-sm"
                      >
                        {formData.status}
                      </Badge>
                      {formData.isFavorite && (
                        <Badge variant="outline" className="px-3 py-1 text-sm border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-800 shadow-sm">
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                          Favori
                        </Badge>
                      )}
                      {formData.category && (
                        <Badge variant="outline" className="px-3 py-1 text-sm shadow-sm">
                          {formData.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">${formData.price}</span>
                      {formData.originalPrice && formData.originalPrice !== formData.price && (
                        <span className="text-lg text-muted-foreground line-through">${formData.originalPrice}</span>
                      )}
                    </div>
                    {formData.originalPrice && formData.price < formData.originalPrice && (
                      <Badge variant="destructive" className="shadow-sm">
                        -{Math.round((1 - formData.price / formData.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>

                  {origDescriptionHtml && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                      <div 
                        className="prose prose-sm max-w-none text-foreground/80 line-clamp-3" 
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(origDescriptionHtml || '') }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onglets */}
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 p-1 bg-muted/50 h-auto shadow-sm">
              <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-md gap-2 py-3">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Général</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-background data-[state=active]:shadow-md gap-2 py-3">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Tarifs</span>
              </TabsTrigger>
              <TabsTrigger value="specs" className="data-[state=active]:bg-background data-[state=active]:shadow-md gap-2 py-3">
                <Ruler className="h-4 w-4" />
                <span className="hidden sm:inline">Specs</span>
              </TabsTrigger>
              <TabsTrigger value="marketing" className="data-[state=active]:bg-background data-[state=active]:shadow-md gap-2 py-3">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Marketing</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-background data-[state=active]:shadow-md gap-2 py-3">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Avancé</span>
              </TabsTrigger>
            </TabsList>

            {/* Général */}
            <TabsContent value="general" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-2 shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Nom du produit *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="Entrez le nom du produit"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold">Catégorie</Label>
                      <Input
                        id="category"
                        value={formData.category || ''}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        placeholder="Ex: Électronique, Mode..."
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description du produit</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Décrivez votre produit en détail..."
                      rows={5}
                      className="resize-none border-2 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-semibold">Statut du produit</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleFieldChange('status', value)}
                      >
                        <SelectTrigger className="h-11 border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">✅ Disponible</SelectItem>
                          <SelectItem value="selected">⭐ Sélectionné</SelectItem>
                          <SelectItem value="imported">📦 Importé</SelectItem>
                          <SelectItem value="pending">⏳ En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end pb-2">
                      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg w-full border">
                        <Switch
                          id="favorite"
                          checked={formData.isFavorite || false}
                          onCheckedChange={(checked) => handleFieldChange('isFavorite', checked)}
                        />
                        <Label htmlFor="favorite" className="text-sm font-medium cursor-pointer flex-1">
                          Marquer comme produit favori
                        </Label>
                        <Heart className={`h-4 w-4 ${formData.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing */}
            <TabsContent value="pricing" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-2 shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Prix de vente *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="h-11 border-2 focus:border-primary transition-colors font-semibold text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice" className="text-sm font-semibold">Prix original</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.originalPrice || ''}
                        onChange={(e) => handleFieldChange('originalPrice', parseFloat(e.target.value) || undefined)}
                        placeholder="0.00"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suggestSellPrice" className="text-sm font-semibold">Prix suggéré CJ</Label>
                      <Input
                        id="suggestSellPrice"
                        value={formData.suggestSellPrice || ''}
                        onChange={(e) => handleFieldChange('suggestSellPrice', e.target.value)}
                        placeholder="Prix recommandé"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {formData.originalPrice && formData.price && (
                    <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10 shadow-inner">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Marge bénéficiaire</p>
                            <p className={`text-2xl font-bold ${formData.price > formData.originalPrice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {((formData.price - formData.originalPrice) / formData.originalPrice * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-center p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Bénéfice par unité</p>
                            <p className={`text-2xl font-bold ${formData.price > formData.originalPrice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              ${(formData.price - formData.originalPrice).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-background/60 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Coût d'achat</p>
                            <p className="text-2xl font-bold text-foreground">
                              ${formData.originalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specs */}
            <TabsContent value="specs" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-2 shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="productSku" className="text-sm font-semibold">SKU / Référence</Label>
                      <Input
                        id="productSku"
                        value={formData.productSku || ''}
                        onChange={(e) => handleFieldChange('productSku', e.target.value)}
                        placeholder="Ex: PRD-12345"
                        className="h-11 border-2 focus:border-primary transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productWeight" className="text-sm font-semibold">Poids produit</Label>
                      <Input
                        id="productWeight"
                        value={formData.productWeight || ''}
                        onChange={(e) => handleFieldChange('productWeight', e.target.value)}
                        placeholder="Ex: 0.5kg"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="packingWeight" className="text-sm font-semibold">Poids avec emballage</Label>
                      <Input
                        id="packingWeight"
                        value={formData.packingWeight || ''}
                        onChange={(e) => handleFieldChange('packingWeight', e.target.value)}
                        placeholder="Ex: 0.7kg"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions" className="text-sm font-semibold">Dimensions (L×l×H)</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions || ''}
                        onChange={(e) => handleFieldChange('dimensions', e.target.value)}
                        placeholder="Ex: 20×15×10 cm"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="productType" className="text-sm font-semibold">Type de produit</Label>
                      <Input
                        id="productType"
                        value={formData.productType || ''}
                        onChange={(e) => handleFieldChange('productType', e.target.value)}
                        placeholder="Ex: Accessoire, Appareil..."
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productUnit" className="text-sm font-semibold">Unité de mesure</Label>
                      <Input
                        id="productUnit"
                        value={formData.productUnit || ''}
                        onChange={(e) => handleFieldChange('productUnit', e.target.value)}
                        placeholder="pièce, lot, kg, paquet..."
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="materialNameEn" className="text-sm font-semibold">Matériau / Composition</Label>
                      <Input
                        id="materialNameEn"
                        value={formData.materialNameEn || ''}
                        onChange={(e) => handleFieldChange('materialNameEn', e.target.value)}
                        placeholder="Ex: Plastique ABS, Coton..."
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packingNameEn" className="text-sm font-semibold">Type d'emballage</Label>
                      <Input
                        id="packingNameEn"
                        value={formData.packingNameEn || ''}
                        onChange={(e) => handleFieldChange('packingNameEn', e.target.value)}
                        placeholder="Ex: Boîte carton, Sachet..."
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Marketing */}
            <TabsContent value="marketing" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-2 shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-sm font-semibold">Marque</Label>
                      <Input
                        id="brand"
                        value={formData.brand || ''}
                        onChange={(e) => handleFieldChange('brand', e.target.value)}
                        placeholder="Nom de la marque"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierName" className="text-sm font-semibold">Fournisseur</Label>
                      <Input
                        id="supplierName"
                        value={formData.supplierName || ''}
                        onChange={(e) => handleFieldChange('supplierName', e.target.value)}
                        placeholder="Nom du fournisseur"
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Tags marketing</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Ajouter un tag (ex: Promotion, Nouveauté...)"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="h-11 border-2 focus:border-primary transition-colors"
                      />
                      <Button 
                        type="button" 
                        onClick={addTag} 
                        size="lg"
                        className="px-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border min-h-[60px]">
                      {currentTags.length > 0 ? (
                        currentTags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 ml-2"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Aucun tag ajouté</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="listedNum" className="text-sm font-semibold">Quantité disponible / Stock</Label>
                    <Input
                      id="listedNum"
                      type="number"
                      min="0"
                      value={formData.listedNum || ''}
                      onChange={(e) => handleFieldChange('listedNum', parseInt(e.target.value) || undefined)}
                      placeholder="Entrez la quantité en stock"
                      className="h-11 border-2 focus:border-primary transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avancé */}
            <TabsContent value="advanced" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="border-2 shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">ID CJ Produit</Label>
                    <Input 
                      value={formData.cjProductId} 
                      disabled 
                      className="h-11 bg-muted/50 font-mono border-2" 
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      🔒 Identifiant unique CJ - Non modifiable
                    </p>
                  </div>

                  {formData.variants && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Variantes (Format JSON)</Label>
                      <Textarea
                        value={formData.variants}
                        onChange={(e) => handleFieldChange('variants', e.target.value)}
                        rows={6}
                        className="font-mono text-sm resize-none border-2 focus:border-primary transition-colors bg-muted/20"
                        placeholder='{"variants": []}'
                      />
                      <p className="text-xs text-muted-foreground">
                        Configuration JSON des différentes variantes du produit
                      </p>
                    </div>
                  )}

                  {formData.reviews && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Avis clients (Format JSON)</Label>
                      <Textarea
                        value={formData.reviews}
                        onChange={(e) => handleFieldChange('reviews', e.target.value)}
                        rows={6}
                        className="font-mono text-sm resize-none border-2 focus:border-primary transition-colors bg-muted/20"
                        placeholder='{"reviews": []}'
                      />
                      <p className="text-xs text-muted-foreground">
                        Données JSON des évaluations et commentaires clients
                      </p>
                    </div>
                  )}

                  <Card className="bg-muted/30 border">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 p-3 bg-background/60 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Créé le</p>
                            <p className="font-semibold">{new Date(formData.createdAt).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-background/60 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded">
                            <Edit className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Modifié le</p>
                            <p className="font-semibold">{new Date(formData.updatedAt).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="pt-4 border-t bg-background/95 backdrop-blur-sm">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={saving}
              className="flex-1 sm:flex-none h-11 border-2 hover:bg-muted/50 transition-all"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 sm:flex-none h-11 shadow-md hover:shadow-lg transition-all"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les modifications
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
