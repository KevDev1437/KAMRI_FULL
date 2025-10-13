'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function OrdersHistory() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // TODO: Remplacer par des données réelles du backend
  const orders: any[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Livrée':
        return '✅';
      case 'En cours de livraison':
        return '🚚';
      case 'Expédiée':
        return '📦';
      case 'En préparation':
        return '⏳';
      case 'Annulée':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* En-tête de la commande */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Commande {order.id}</h3>
                    <p className="text-sm text-gray-600">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${order.statusColor}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{order.total.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de la commande */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{item.price.toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-[#4CAF50] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#45a049] transition-colors">
                  Suivre la commande
                </button>
                <button className="flex-1 bg-white text-[#4CAF50] border border-[#4CAF50] py-2 px-4 rounded-lg font-medium hover:bg-[#E8F5E8] transition-colors">
                  Voir les détails
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Aucune commande pour le moment
          </h3>
          <p className="text-gray-500 mb-6">
            Vos commandes apparaîtront ici une fois que vous aurez passé votre première commande.
          </p>
          <button className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#45a049] transition-colors">
            Découvrir nos produits
          </button>
        </motion.div>
      )}
    </div>
  );
}