import { Category, Ingredient, Dish, WeeklyMenu } from '../models/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    "id": "cat_carniceria",
    "name": "Carnicería y Aves",
    "icon": "beef",
    "color": "#ef4444",
    "orderIndex": 1
  },
  {
    "id": "cat_pescaderia",
    "name": "Pescadería",
    "icon": "fish",
    "color": "#06b6d4",
    "orderIndex": 2
  },
  {
    "id": "cat_charcuteria",
    "name": "Charcutería y Lácteos",
    "icon": "milk",
    "color": "#f59e0b",
    "orderIndex": 3
  },
  {
    "id": "cat_verduras",
    "name": "Verduras y Vegetales",
    "icon": "carrot",
    "color": "#10b981",
    "orderIndex": 4
  },
  {
    "id": "cat_frutas",
    "name": "Frutas",
    "icon": "apple",
    "color": "#84cc16",
    "orderIndex": 5
  },
  {
    "id": "cat_viveres",
    "name": "Mercado Seco y Víveres",
    "icon": "wheat",
    "color": "#8b5cf6",
    "orderIndex": 6
  },
  {
    "id": "cat_limpieza",
    "name": "Perfumería y Limpieza",
    "icon": "sparkles",
    "color": "#3b82f6",
    "orderIndex": 7
  },
  {
    "id": "cat_farmacia",
    "name": "Farmacia",
    "icon": "pill",
    "color": "#ec4899",
    "orderIndex": 8
  },
  {
    "id": "cat_otros",
    "name": "Otros / Varios",
    "icon": "shopping-cart",
    "color": "#64748b",
    "orderIndex": 9
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    "id": "ing_0001",
    "householdId": "default_home",
    "name": "Pechuga de Pollo",
    "categoryId": "cat_carniceria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0002",
    "householdId": "default_home",
    "name": "Carne Molida",
    "categoryId": "cat_carniceria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0003",
    "householdId": "default_home",
    "name": "Bistecs de Res",
    "categoryId": "cat_carniceria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0004",
    "householdId": "default_home",
    "name": "Chuletas de Cochino",
    "categoryId": "cat_carniceria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0005",
    "householdId": "default_home",
    "name": "Costillas de Res",
    "categoryId": "cat_carniceria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0006",
    "householdId": "default_home",
    "name": "Merluza",
    "categoryId": "cat_pescaderia",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0007",
    "householdId": "default_home",
    "name": "Atún en Lata",
    "categoryId": "cat_pescaderia",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0008",
    "householdId": "default_home",
    "name": "Camarones",
    "categoryId": "cat_pescaderia",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0009",
    "householdId": "default_home",
    "name": "Pescado Fresco",
    "categoryId": "cat_pescaderia",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0010",
    "householdId": "default_home",
    "name": "Queso Blanco",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0011",
    "householdId": "default_home",
    "name": "Queso Parmesano",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0012",
    "householdId": "default_home",
    "name": "Queso Amarillo",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0013",
    "householdId": "default_home",
    "name": "Jamón de Pierna",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0014",
    "householdId": "default_home",
    "name": "Leche",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0015",
    "householdId": "default_home",
    "name": "Mantequilla",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0016",
    "householdId": "default_home",
    "name": "Huevos",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0017",
    "householdId": "default_home",
    "name": "Ricotta",
    "categoryId": "cat_charcuteria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0018",
    "householdId": "default_home",
    "name": "Papas",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0019",
    "householdId": "default_home",
    "name": "Cebolla",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0020",
    "householdId": "default_home",
    "name": "Cebolla Morada",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0021",
    "householdId": "default_home",
    "name": "Pimentón",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0022",
    "householdId": "default_home",
    "name": "Ají Dulce",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0023",
    "householdId": "default_home",
    "name": "Ajo",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0024",
    "householdId": "default_home",
    "name": "Cebollín",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0025",
    "householdId": "default_home",
    "name": "Ajoporro",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0026",
    "householdId": "default_home",
    "name": "Zanahoria",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0027",
    "householdId": "default_home",
    "name": "Plátanos Maduros",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0028",
    "householdId": "default_home",
    "name": "Plátanos Verdes",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0029",
    "householdId": "default_home",
    "name": "Yuca",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0030",
    "householdId": "default_home",
    "name": "Brócoli",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0031",
    "householdId": "default_home",
    "name": "Espinacas",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0032",
    "householdId": "default_home",
    "name": "Lechuga",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0033",
    "householdId": "default_home",
    "name": "Tomates",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0034",
    "householdId": "default_home",
    "name": "Repollo",
    "categoryId": "cat_carniceria",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0035",
    "householdId": "default_home",
    "name": "Cilantro",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0036",
    "householdId": "default_home",
    "name": "Perejil",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0037",
    "householdId": "default_home",
    "name": "Arroz",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0038",
    "householdId": "default_home",
    "name": "Caraotas Negras",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0039",
    "householdId": "default_home",
    "name": "Lentejas",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0040",
    "householdId": "default_home",
    "name": "Fideos",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0041",
    "householdId": "default_home",
    "name": "Pasta Larga",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0042",
    "householdId": "default_home",
    "name": "Pasta Corta",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0043",
    "householdId": "default_home",
    "name": "Harina PAN",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0044",
    "householdId": "default_home",
    "name": "Pan Rallado",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0045",
    "householdId": "default_home",
    "name": "Extracto de Tomate",
    "categoryId": "cat_verduras",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0046",
    "householdId": "default_home",
    "name": "Mayonesa",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0047",
    "householdId": "default_home",
    "name": "Mostaza",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0048",
    "householdId": "default_home",
    "name": "Salsa de Soya",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0049",
    "householdId": "default_home",
    "name": "Aceite Vegetal",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0050",
    "householdId": "default_home",
    "name": "Sal",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0051",
    "householdId": "default_home",
    "name": "Pimienta",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0052",
    "householdId": "default_home",
    "name": "Comino",
    "categoryId": "cat_viveres",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0053",
    "householdId": "default_home",
    "name": "Limones",
    "categoryId": "cat_frutas",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0054",
    "householdId": "default_home",
    "name": "Naranjas",
    "categoryId": "cat_frutas",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "ing_0055",
    "householdId": "default_home",
    "name": "Cambur",
    "categoryId": "cat_frutas",
    "updatedAt": "2026-08-15T12:00:00.000Z"
  }
];

export const INITIAL_DISHES: Dish[] = [
  {
    "id": "dish_0001",
    "householdId": "default_home",
    "name": "Albondigas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0002",
    "householdId": "default_home",
    "name": "Albondigas de papa",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DYkmGEGPGKf/",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0003",
    "householdId": "default_home",
    "name": "Albóndigas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0004",
    "householdId": "default_home",
    "name": "Albóndigas con salsa",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0005",
    "householdId": "default_home",
    "name": "Arrollado de Papa y Zanahoria",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DXAp-D8kaVZ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0006",
    "householdId": "default_home",
    "name": "Arroz con Pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0007",
    "householdId": "default_home",
    "name": "Arvejas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0008",
    "householdId": "default_home",
    "name": "Arvejitas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0009",
    "householdId": "default_home",
    "name": "Bistecs a la criolla",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0010",
    "householdId": "default_home",
    "name": "Caraotas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0038",
      "ing_0019",
      "ing_0021",
      "ing_0052",
      "ing_0022"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0011",
    "householdId": "default_home",
    "name": "Caraotas Negras",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0038",
      "ing_0019",
      "ing_0021",
      "ing_0052",
      "ing_0022"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0012",
    "householdId": "default_home",
    "name": "Caraotas blancas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0038",
      "ing_0019",
      "ing_0021",
      "ing_0052",
      "ing_0022"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0013",
    "householdId": "default_home",
    "name": "Carne saltada",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0014",
    "householdId": "default_home",
    "name": "Carne saltada con vegetales",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0015",
    "householdId": "default_home",
    "name": "Cerdo Agridulce",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0016",
    "householdId": "default_home",
    "name": "Chili",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0017",
    "householdId": "default_home",
    "name": "Chili con carne",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0018",
    "householdId": "default_home",
    "name": "Chuleta Fresca",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0019",
    "householdId": "default_home",
    "name": "Chuleta de cochino",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0020",
    "householdId": "default_home",
    "name": "Chuletas Ahumadas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0021",
    "householdId": "default_home",
    "name": "Chuletas de Cochino",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0022",
    "householdId": "default_home",
    "name": "Cochino envuelto en papitas fritas",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DTAhnRnDcem",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0023",
    "householdId": "default_home",
    "name": "Coditos de Pollo saltado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0024",
    "householdId": "default_home",
    "name": "Costillas guisadas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0025",
    "householdId": "default_home",
    "name": "Croquetas de Atún",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0026",
    "householdId": "default_home",
    "name": "Dumplings",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0027",
    "householdId": "default_home",
    "name": "Enrollado de Carne",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0028",
    "householdId": "default_home",
    "name": "Enrollado de pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0029",
    "householdId": "default_home",
    "name": "Ensalada de pollo",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DZYEdMkMqlE/",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0030",
    "householdId": "default_home",
    "name": "Fabada",
    "type": "protein",
    "recipeUrl": "https://www.youtube.com/watch?v=lcFUCaqAjCo",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0031",
    "householdId": "default_home",
    "name": "Fish & Chips",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0032",
    "householdId": "default_home",
    "name": "Fish And Chips",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0033",
    "householdId": "default_home",
    "name": "Gordon blue de pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0034",
    "householdId": "default_home",
    "name": "Gordon blue pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0035",
    "householdId": "default_home",
    "name": "Hamburguesitas de Atún",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0036",
    "householdId": "default_home",
    "name": "Kebab",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DRUyL-_jMaW/",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0037",
    "householdId": "default_home",
    "name": "LQDD",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0038",
    "householdId": "default_home",
    "name": "Lentejas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0039",
    "householdId": "default_home",
    "name": "Lomo de cerdo empanizadas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0040",
    "householdId": "default_home",
    "name": "Malfatti con Strogonoff de Pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0041",
    "householdId": "default_home",
    "name": "Malzemeler Calabacines rellenos de Carne Molida",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0042",
    "householdId": "default_home",
    "name": "Milanesa de carne",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0043",
    "householdId": "default_home",
    "name": "Milanesas de Res Empanizadas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0044",
    "householdId": "default_home",
    "name": "Milanesas de pollo al ajillo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0045",
    "householdId": "default_home",
    "name": "Milanesas de pollo envueltas en papas fritas platanos dulces",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0046",
    "householdId": "default_home",
    "name": "Milanesas de res",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0047",
    "householdId": "default_home",
    "name": "Minestrone",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0048",
    "householdId": "default_home",
    "name": "Mondongo o Callos?",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DV_EfZ8NXAh/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0049",
    "householdId": "default_home",
    "name": "Musaka",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0050",
    "householdId": "default_home",
    "name": "Muslos de Pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0051",
    "householdId": "default_home",
    "name": "Nuggets de pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0052",
    "householdId": "default_home",
    "name": "Panquecas de pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0053",
    "householdId": "default_home",
    "name": "Pasta Bologna",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0054",
    "householdId": "default_home",
    "name": "Pasta con atún",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0055",
    "householdId": "default_home",
    "name": "Pasta con atún y camarones",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0056",
    "householdId": "default_home",
    "name": "Pasta con salsa Bologna",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0057",
    "householdId": "default_home",
    "name": "Pasta en salsa de atún",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0058",
    "householdId": "default_home",
    "name": "Pasta matricciana de chuleta",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0059",
    "householdId": "default_home",
    "name": "Pastel de Carne tipo chucho",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0060",
    "householdId": "default_home",
    "name": "Pasticho",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0061",
    "householdId": "default_home",
    "name": "Pasticho de Dumpling",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DWxSIfSjs3m",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0062",
    "householdId": "default_home",
    "name": "Pasticho de calabacín",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0063",
    "householdId": "default_home",
    "name": "Patacones",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0064",
    "householdId": "default_home",
    "name": "Pescado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0009",
      "ing_0053",
      "ing_0049",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0065",
    "householdId": "default_home",
    "name": "Pescado a la plancha",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0009",
      "ing_0053",
      "ing_0049",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0066",
    "householdId": "default_home",
    "name": "Pimentones Rellenos",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0067",
    "householdId": "default_home",
    "name": "Pollo Jardinera",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0068",
    "householdId": "default_home",
    "name": "Pollo Saltado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0069",
    "householdId": "default_home",
    "name": "Pollo Saltado Chino",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0070",
    "householdId": "default_home",
    "name": "Pollo a la Luisa",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0071",
    "householdId": "default_home",
    "name": "Pollo a la Plancha",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0072",
    "householdId": "default_home",
    "name": "Pollo a la jardinera",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0073",
    "householdId": "default_home",
    "name": "Pollo sudado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0074",
    "householdId": "default_home",
    "name": "Rollitos de Carne rellenos de ricotta",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0075",
    "householdId": "default_home",
    "name": "Rollo de Carne",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0076",
    "householdId": "default_home",
    "name": "Rollo de pollo",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DaDjxmcMnA8/",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0077",
    "householdId": "default_home",
    "name": "Ruedas de Pescado al ajillo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0009",
      "ing_0053",
      "ing_0049",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0078",
    "householdId": "default_home",
    "name": "Shumais",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0079",
    "householdId": "default_home",
    "name": "Strogonoff de pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0080",
    "householdId": "default_home",
    "name": "Strogonoff de pollo arroz",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0081",
    "householdId": "default_home",
    "name": "Tenders de Pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0082",
    "householdId": "default_home",
    "name": "alguna pasta bolognesa",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0083",
    "householdId": "default_home",
    "name": "bolognesa",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0084",
    "householdId": "default_home",
    "name": "calle",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0085",
    "householdId": "default_home",
    "name": "callos",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0086",
    "householdId": "default_home",
    "name": "canoas calabacín",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0087",
    "householdId": "default_home",
    "name": "caracolitos salsa bolognesa",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0088",
    "householdId": "default_home",
    "name": "chino",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0089",
    "householdId": "default_home",
    "name": "chuleta ahumada",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0090",
    "householdId": "default_home",
    "name": "chuleta de cerdo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0091",
    "householdId": "default_home",
    "name": "chuletas ahumadas en salsa agridulce",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0092",
    "householdId": "default_home",
    "name": "chuletas frescas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0093",
    "householdId": "default_home",
    "name": "churrascos de pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0094",
    "householdId": "default_home",
    "name": "churrascos pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0095",
    "householdId": "default_home",
    "name": "club house papas fritas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0096",
    "householdId": "default_home",
    "name": "cochino agridulce",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0097",
    "householdId": "default_home",
    "name": "costillas y alitas barbeque",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0098",
    "householdId": "default_home",
    "name": "croquetas de merluza",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0009",
      "ing_0053",
      "ing_0049",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0099",
    "householdId": "default_home",
    "name": "fideuá / restos de nevera",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0100",
    "householdId": "default_home",
    "name": "hamburguesas res y cerdo papas fritas queso y tocineta",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0101",
    "householdId": "default_home",
    "name": "kibbles",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0102",
    "householdId": "default_home",
    "name": "lentejas con mini albóndigas de pollo molido",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0103",
    "householdId": "default_home",
    "name": "lomo de cerdo empanizado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0104",
    "householdId": "default_home",
    "name": "merlusa",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0105",
    "householdId": "default_home",
    "name": "merluza",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0009",
      "ing_0053",
      "ing_0049",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0106",
    "householdId": "default_home",
    "name": "milanesa de pollo empanizada",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0107",
    "householdId": "default_home",
    "name": "milanesa res empanadas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0108",
    "householdId": "default_home",
    "name": "milanesas de crane",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0109",
    "householdId": "default_home",
    "name": "milanesas de pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0110",
    "householdId": "default_home",
    "name": "milanesas de pollo a la plancha",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0111",
    "householdId": "default_home",
    "name": "milanesas de pollo empanizadas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0112",
    "householdId": "default_home",
    "name": "milanesas de res enpanizadas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0113",
    "householdId": "default_home",
    "name": "muslos horneados",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0114",
    "householdId": "default_home",
    "name": "pasta bolognesa",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0115",
    "householdId": "default_home",
    "name": "pasta camarones",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0116",
    "householdId": "default_home",
    "name": "pasta con caraotas",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0038",
      "ing_0019",
      "ing_0021",
      "ing_0052",
      "ing_0022"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0117",
    "householdId": "default_home",
    "name": "perro calientes a la parrilla",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0118",
    "householdId": "default_home",
    "name": "pinchos papas frita ensalada",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0119",
    "householdId": "default_home",
    "name": "pollito a la plancha",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0120",
    "householdId": "default_home",
    "name": "pollo agridulce",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0121",
    "householdId": "default_home",
    "name": "pollo buda",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0122",
    "householdId": "default_home",
    "name": "pollo con calabacín",
    "type": "protein",
    "recipeUrl": "https://www.instagram.com/reel/DK-NFmIIDmQ",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0123",
    "householdId": "default_home",
    "name": "pollo en salsa agridulce",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0124",
    "householdId": "default_home",
    "name": "pollo horneado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0125",
    "householdId": "default_home",
    "name": "pollo salteado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0126",
    "householdId": "default_home",
    "name": "rollitos de pollo y calabacin",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0127",
    "householdId": "default_home",
    "name": "ruedas de pescado",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0009",
      "ing_0053",
      "ing_0049",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0128",
    "householdId": "default_home",
    "name": "saltado de carne",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0129",
    "householdId": "default_home",
    "name": "sancocho",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0130",
    "householdId": "default_home",
    "name": "tenders pollo",
    "type": "protein",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0131",
    "householdId": "default_home",
    "name": "Aborrajados de Platano",
    "type": "side",
    "recipeUrl": "https://www.instagram.com/reel/DWSS20Rkckl",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0132",
    "householdId": "default_home",
    "name": "Arroz",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0133",
    "householdId": "default_home",
    "name": "Arroz Brocoli al Ajillo",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0134",
    "householdId": "default_home",
    "name": "Arroz Sorpresa Ensalada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0135",
    "householdId": "default_home",
    "name": "Arroz al Limón y Tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0136",
    "householdId": "default_home",
    "name": "Arroz con Maizitos Ensalada Verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0137",
    "householdId": "default_home",
    "name": "Arroz con lentejas y cebolla frita, Plátanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0138",
    "householdId": "default_home",
    "name": "Arroz frito y Lumpias",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0139",
    "householdId": "default_home",
    "name": "Arroz salteado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0140",
    "householdId": "default_home",
    "name": "Arroz y Platanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0141",
    "householdId": "default_home",
    "name": "Arroz y Platanos sancochado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0142",
    "householdId": "default_home",
    "name": "Arroz y Plátano",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0143",
    "householdId": "default_home",
    "name": "Arroz y Plátanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0144",
    "householdId": "default_home",
    "name": "Arroz y Plátanos dulces",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0145",
    "householdId": "default_home",
    "name": "Arroz y Tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0146",
    "householdId": "default_home",
    "name": "Arroz y pico de gallo",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0147",
    "householdId": "default_home",
    "name": "Arroz. Tabule",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0148",
    "householdId": "default_home",
    "name": "Capresa",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0149",
    "householdId": "default_home",
    "name": "Carne Mechada, Queso Rallado, Salsa de Ajo, Hoja Verde, Tomate Rebanado.",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0150",
    "householdId": "default_home",
    "name": "Chucrut falso tortillas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0151",
    "householdId": "default_home",
    "name": "Colcannon (Puré Aliñado) y Plátanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0152",
    "householdId": "default_home",
    "name": "Eby Fry y ensalada asiática",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0153",
    "householdId": "default_home",
    "name": "Ensalada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0154",
    "householdId": "default_home",
    "name": "Ensalada César",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0155",
    "householdId": "default_home",
    "name": "Ensalada César Arroz",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0156",
    "householdId": "default_home",
    "name": "Ensalada Rusa Ensalada de falso Chucrut",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0157",
    "householdId": "default_home",
    "name": "Ensalada Rusa Plátanos Dulces",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0158",
    "householdId": "default_home",
    "name": "Ensalada Verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0159",
    "householdId": "default_home",
    "name": "Ensalada Verde Arroz",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0160",
    "householdId": "default_home",
    "name": "Ensalada Verde Asiatica",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0161",
    "householdId": "default_home",
    "name": "Ensalada Verde y Plátanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0162",
    "householdId": "default_home",
    "name": "Ensalada rusa y ensalada miel mostaza",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0163",
    "householdId": "default_home",
    "name": "Ensalada rusa y plátanos dulces",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0164",
    "householdId": "default_home",
    "name": "Ensalada y puré de papas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0165",
    "householdId": "default_home",
    "name": "Falso chucrut y papas bravas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0166",
    "householdId": "default_home",
    "name": "Fideos Con Gengibre y Cebollin. Arroz Saltado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0167",
    "householdId": "default_home",
    "name": "Fideos de Arroz con Jenjibre y Cebollin. Vegetales Salteados estilo Buda.",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0168",
    "householdId": "default_home",
    "name": "Fideos gengibre y cebollín",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0169",
    "householdId": "default_home",
    "name": "Papas Bravas Brócoli Salteado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0170",
    "householdId": "default_home",
    "name": "Papas Fritas Ensalada rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0171",
    "householdId": "default_home",
    "name": "Papas Fritas y ensalada rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0172",
    "householdId": "default_home",
    "name": "Papas bravas ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0173",
    "householdId": "default_home",
    "name": "Papas fritas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0174",
    "householdId": "default_home",
    "name": "Pasta y tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0175",
    "householdId": "default_home",
    "name": "Patacones Maracuchos, pico de gallo, guacamole, queso rayado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0176",
    "householdId": "default_home",
    "name": "Plátano",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0177",
    "householdId": "default_home",
    "name": "Plátano Sancochado Ensalada Verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0178",
    "householdId": "default_home",
    "name": "Plátano sancochado puré de Instagram",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0179",
    "householdId": "default_home",
    "name": "Plátano y ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0180",
    "householdId": "default_home",
    "name": "Plátanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0181",
    "householdId": "default_home",
    "name": "Plátanos Dulces",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0182",
    "householdId": "default_home",
    "name": "Pure con Repollo Colcannon Ensalada Rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0183",
    "householdId": "default_home",
    "name": "Puré de Papa. Ensalada.",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0184",
    "householdId": "default_home",
    "name": "Puré de papa con ajo porro y repollo",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0185",
    "householdId": "default_home",
    "name": "Puré de papas Ensalada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0186",
    "householdId": "default_home",
    "name": "Puré de papas con ajo porro y repollo",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0187",
    "householdId": "default_home",
    "name": "Puré de papas ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0188",
    "householdId": "default_home",
    "name": "Puré ensalada plátanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0189",
    "householdId": "default_home",
    "name": "Puré y ensalada de lechuga y tomate",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0190",
    "householdId": "default_home",
    "name": "Tabuleh Tortillas de Plátano Hummus? Tortillas Fritas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0191",
    "householdId": "default_home",
    "name": "Tabuleh Hummus Pan árabe",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0192",
    "householdId": "default_home",
    "name": "Tabuleh, hummus, pancitos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0193",
    "householdId": "default_home",
    "name": "Tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0194",
    "householdId": "default_home",
    "name": "Torticas de arroz Ensalada Verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0195",
    "householdId": "default_home",
    "name": "Tortillas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0196",
    "householdId": "default_home",
    "name": "Vegetales y tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0197",
    "householdId": "default_home",
    "name": "Yuca frita y ensalada rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0198",
    "householdId": "default_home",
    "name": "Yuca sancochada con salsa verde Ensalada miel mostaza",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0199",
    "householdId": "default_home",
    "name": "Yuca sancochada ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0200",
    "householdId": "default_home",
    "name": "Yuca sancochada y brócoli gratinado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0201",
    "householdId": "default_home",
    "name": "Yuca y Ensalada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0202",
    "householdId": "default_home",
    "name": "arroz al limón. pico de gallo. guacamole. Tostitos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0203",
    "householdId": "default_home",
    "name": "arroz chino",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0204",
    "householdId": "default_home",
    "name": "arroz chino y vegetales buda",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0205",
    "householdId": "default_home",
    "name": "arroz ensalada de lechuga miel mostaza",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0206",
    "householdId": "default_home",
    "name": "arroz ensalada rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0207",
    "householdId": "default_home",
    "name": "arroz ensalada rayada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0208",
    "householdId": "default_home",
    "name": "arroz o fideos jengibre cebollin",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0209",
    "householdId": "default_home",
    "name": "arroz plátano horneado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0210",
    "householdId": "default_home",
    "name": "arroz plátanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0211",
    "householdId": "default_home",
    "name": "arroz rollos de huevo y cebollín",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0023",
      "ing_0002",
      "ing_0019",
      "ing_0016",
      "ing_0044",
      "ing_0021"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0212",
    "householdId": "default_home",
    "name": "arroz saltado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0213",
    "householdId": "default_home",
    "name": "arroz tajada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0214",
    "householdId": "default_home",
    "name": "arroz y ensalada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0215",
    "householdId": "default_home",
    "name": "arroz y ensalada miel mostaza",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0216",
    "householdId": "default_home",
    "name": "arroz y tajada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0217",
    "householdId": "default_home",
    "name": "arroz, tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0050",
      "ing_0037",
      "ing_0023"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0218",
    "householdId": "default_home",
    "name": "caracoles tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0219",
    "householdId": "default_home",
    "name": "casabe/ arepitas de chicharrón",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0220",
    "householdId": "default_home",
    "name": "ensalada casabe",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0221",
    "householdId": "default_home",
    "name": "ensalada miel mostaza Tostones",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0222",
    "householdId": "default_home",
    "name": "ensalada rayada puré de papas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0223",
    "householdId": "default_home",
    "name": "ensalada rusa",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0224",
    "householdId": "default_home",
    "name": "ensalada rusa tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0225",
    "householdId": "default_home",
    "name": "ensalada rusa y ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0226",
    "householdId": "default_home",
    "name": "ensalada rusa y platanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0227",
    "householdId": "default_home",
    "name": "falso chucrut ensalada rusa",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0228",
    "householdId": "default_home",
    "name": "fideos jengibre cebollín",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0229",
    "householdId": "default_home",
    "name": "fideos con gengibre y cebollín, chopsuey",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0230",
    "householdId": "default_home",
    "name": "fideos jengibre y cebollín",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0231",
    "householdId": "default_home",
    "name": "papa frita",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0232",
    "householdId": "default_home",
    "name": "papas al vapor ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0233",
    "householdId": "default_home",
    "name": "papas bravas ensalada cesar",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0234",
    "householdId": "default_home",
    "name": "papas con romero",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0235",
    "householdId": "default_home",
    "name": "papas fritas ensalada de repollo",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0236",
    "householdId": "default_home",
    "name": "papas fritas ensalada repollo y zanahoria",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0237",
    "householdId": "default_home",
    "name": "papas fritas y ensalada rallads",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0238",
    "householdId": "default_home",
    "name": "papas fritas, ensalada rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0239",
    "householdId": "default_home",
    "name": "papitas fritas y ensalada rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0240",
    "householdId": "default_home",
    "name": "pasta corta",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0241",
    "householdId": "default_home",
    "name": "pasta, tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0242",
    "householdId": "default_home",
    "name": "platanitos dulces y ensalada rusa",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0026",
      "ing_0016",
      "ing_0046",
      "ing_0018"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0243",
    "householdId": "default_home",
    "name": "platanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0244",
    "householdId": "default_home",
    "name": "plátano sancochado",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0245",
    "householdId": "default_home",
    "name": "plátanos sancochados y ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0246",
    "householdId": "default_home",
    "name": "pure",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0247",
    "householdId": "default_home",
    "name": "pure de papas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0248",
    "householdId": "default_home",
    "name": "pure de papas platanos dulces",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0249",
    "householdId": "default_home",
    "name": "pure de papas y ensalada miel mostaza",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0250",
    "householdId": "default_home",
    "name": "pure y plátanos dulces",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0251",
    "householdId": "default_home",
    "name": "puré / caracolitos y tajada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0252",
    "householdId": "default_home",
    "name": "puré ajoporro y repollo pebre",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0253",
    "householdId": "default_home",
    "name": "puré de papas y Tajadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0254",
    "householdId": "default_home",
    "name": "puré de papas y platanos",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0255",
    "householdId": "default_home",
    "name": "puré ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0256",
    "householdId": "default_home",
    "name": "puré plátanos dulces",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0257",
    "householdId": "default_home",
    "name": "puré y ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0258",
    "householdId": "default_home",
    "name": "puré y pebre",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0014",
      "ing_0050",
      "ing_0018",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0259",
    "householdId": "default_home",
    "name": "tajadas, ensalada rusa",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0049",
      "ing_0027"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0260",
    "householdId": "default_home",
    "name": "tostones y ensalada rallada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0261",
    "householdId": "default_home",
    "name": "verduras sancochadas",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0262",
    "householdId": "default_home",
    "name": "yuca con mojito ensalada verde",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0053",
      "ing_0019",
      "ing_0033",
      "ing_0032"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0263",
    "householdId": "default_home",
    "name": "yuca frita",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0264",
    "householdId": "default_home",
    "name": "yuca sancochada",
    "type": "side",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0265",
    "householdId": "default_home",
    "name": "Arepa",
    "type": "dinner",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0010",
      "ing_0050",
      "ing_0043",
      "ing_0015"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0266",
    "householdId": "default_home",
    "name": "Bolllito",
    "type": "dinner",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0267",
    "householdId": "default_home",
    "name": "Sopa de Fideos",
    "type": "dinner",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0268",
    "householdId": "default_home",
    "name": "Sopa de Maíz",
    "type": "dinner",
    "recipeUrl": "",
    "ingredientIds": [],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": "dish_0269",
    "householdId": "default_home",
    "name": "Sopa de Pollo",
    "type": "dinner",
    "recipeUrl": "",
    "ingredientIds": [
      "ing_0001",
      "ing_0051",
      "ing_0023",
      "ing_0019",
      "ing_0021",
      "ing_0050"
    ],
    "updatedAt": "2026-08-15T12:00:00.000Z"
  }
];
