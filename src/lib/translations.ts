export type Language = "ar" | "en" | "fr";

export const translations = {
  ar: {
    // General
    dashboard: "لوحة التحكم",
    logout: "تسجيل الخروج",
    online: "متصل:",
    
    // Sidebar
    overview: "نظرة عامة",
    orders: "الطلبيات",
    team: "فريق العمل",
    landingPages: "صفحات الهبوط",
    expenses: "النفقات",
    delivery: "التوصيل (الولايات)",
    versements: "المدفوعات (Versements)",
    settings: "الإعدادات",
    calculator: "حاسبة الأرباح",
    refills: "إعادة الطلب",

    // Dashboard Home
    todayStats: "إحصائيات اليوم",
    thisMonth: "هذا الشهر",
    adSpend: "تكلفة الإعلانات",
    leads: "الطلبات (Leads)",
    confirmed: "المؤكدة",
    delivered: "المستلمة",
    profit: "الربح الصافي",
    
    // Orders
    totalOrders: "إجمالي الطلبات",
    pending: "قيد المعالجة",
    draft: "غير مكتملة",
    cancelled: "ملغاة",
    searchPlaceholder: "بحث بالاسم أو الهاتف أو الولاية...",
    allStatuses: "كل الحالات",
    allProducts: "كل المنتجات",
    exportExcel: "تصدير Excel",
    printSelected: "طباعة المحددة",
    assignAgent: "تحويل لموظف آخر",
    sendToDelivery: "إرسال لشركة التوصيل",
    customer: "الزبون",
    phone: "الهاتف",
    wilaya: "الولاية",
    product: "المنتج / العرض",
    deliveryCol: "التوصيل",
    total: "الإجمالي",
    status: "الحالة",
    date: "التاريخ",
    edit: "تعديل",
    freeShipping: "توصيل مجاني",
  },
  en: {
    // General
    dashboard: "Dashboard",
    logout: "Logout",
    online: "Online:",
    
    // Sidebar
    overview: "Overview",
    orders: "Orders",
    team: "Team Management",
    landingPages: "Landing Pages",
    expenses: "Expenses",
    delivery: "Delivery (Regions)",
    versements: "Payments (Versements)",
    settings: "Settings",
    calculator: "Profit Calculator",
    refills: "Refills",

    // Dashboard Home
    todayStats: "Today's Stats",
    thisMonth: "This Month",
    adSpend: "Ad Spend",
    leads: "Leads",
    confirmed: "Confirmed",
    delivered: "Delivered",
    profit: "Net Profit",
    
    // Orders
    totalOrders: "Total Orders",
    pending: "Pending",
    draft: "Draft",
    cancelled: "Cancelled",
    searchPlaceholder: "Search by name, phone or region...",
    allStatuses: "All Statuses",
    allProducts: "All Products",
    exportExcel: "Export Excel",
    printSelected: "Print Selected",
    assignAgent: "Assign to Agent",
    sendToDelivery: "Send to Delivery",
    customer: "Customer",
    phone: "Phone",
    wilaya: "Region",
    product: "Product / Offer",
    deliveryCol: "Delivery",
    total: "Total",
    status: "Status",
    date: "Date",
    edit: "Edit",
    freeShipping: "Free Shipping",
  },
  fr: {
    // General
    dashboard: "Tableau de bord",
    logout: "Déconnexion",
    online: "En ligne:",
    
    // Sidebar
    overview: "Vue d'ensemble",
    orders: "Commandes",
    team: "Équipe",
    landingPages: "Pages de Vente",
    expenses: "Dépenses",
    delivery: "Livraison (Wilayas)",
    versements: "Versements",
    settings: "Paramètres",
    calculator: "Calculatrice",
    refills: "Renouvellements",

    // Dashboard Home
    todayStats: "Stats d'aujourd'hui",
    thisMonth: "Ce Mois",
    adSpend: "Dépenses Pub",
    leads: "Leads",
    confirmed: "Confirmées",
    delivered: "Livrées",
    profit: "Bénéfice Net",
    
    // Orders
    totalOrders: "Total des Commandes",
    pending: "En Attente",
    draft: "Brouillon",
    cancelled: "Annulées",
    searchPlaceholder: "Rechercher par nom, tél ou wilaya...",
    allStatuses: "Tous les statuts",
    allProducts: "Tous les produits",
    exportExcel: "Exporter Excel",
    printSelected: "Imprimer la sélection",
    assignAgent: "Assigner à un agent",
    sendToDelivery: "Envoyer à la livraison",
    customer: "Client",
    phone: "Téléphone",
    wilaya: "Wilaya",
    product: "Produit / Offre",
    deliveryCol: "Livraison",
    total: "Total",
    status: "Statut",
    date: "Date",
    edit: "Modifier",
    freeShipping: "Livraison Gratuite",
  }
};

export function getTranslation(lang: Language, key: keyof typeof translations.en) {
  return translations[lang][key] || translations.ar[key] || key;
}
