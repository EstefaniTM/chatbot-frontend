export const searchInventory = (query, inventoryData) => {
  if (!inventoryData.length) return null;
  const lowercaseQuery = query.toLowerCase();
  const matchingProducts = inventoryData.filter(item => {
    return Object.values(item).some(value => 
      value && value.toString().toLowerCase().includes(lowercaseQuery)
    );
  });
  if (matchingProducts.length > 0) {
    if (lowercaseQuery.includes('cuánto') || lowercaseQuery.includes('cantidad')) {
      const product = matchingProducts[0];
      const quantityField = Object.keys(product).find(key => 
        key.toLowerCase().includes('cantidad') || 
        key.toLowerCase().includes('stock') ||
        key.toLowerCase().includes('qty')
      );
      if (quantityField) {
        return `Tienes ${product[quantityField]} unidades de ${product[Object.keys(product)[1]] || 'ese producto'}.`;
      }
    }
    return `Encontré ${matchingProducts.length} producto(s) relacionado(s). El primero es: ${JSON.stringify(matchingProducts[0], null, 2)}`;
  }
  return null;
};

export const formatTimestamp = (timestamp) => {
  return timestamp.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
