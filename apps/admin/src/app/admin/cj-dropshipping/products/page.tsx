'use client'

import { CJSearchDashboard } from '@/components/cj/CJSearchDashboard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CJDropshippingProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux produits
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produits CJ Dropshipping</h1>
            <p className="text-gray-600 mt-2">
              Recherchez et importez des produits depuis le catalogue CJ Dropshipping
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard CJ */}
      <CJSearchDashboard />
    </div>
  )
}