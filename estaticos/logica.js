// estaticos/logica.js

// =======================
// Datos simulados
// =======================

let ajustes = {
  tamanoHogar: 2,
  alergias: [],
  presupuestoCompra: 200000, // COP
};

let inventario = [
  {
    id: 1,
    nombre: "Leche deslactosada",
    cantidad: 1,
    unidad: "unidades",
    fechaEntrada: "2025-11-20",
    fechaCaducidad: "2025-11-29",
    categoria: "Lácteos",
    nota: "Para desayunos",
    frecuenciaDias: 7,
    proximaNecesidad: "2025-12-03",
    precioEstimado: 6000,
  },
  {
    id: 2,
    nombre: "Huevos",
    cantidad: 6,
    unidad: "unidades",
    fechaEntrada: "2025-11-22",
    fechaCaducidad: "2025-12-05",
    categoria: "Proteínas",
    nota: "Omelette, revueltos",
    frecuenciaDias: 5,
    proximaNecesidad: "2025-11-30",
    precioEstimado: 800,
  },
  {
    id: 3,
    nombre: "Arroz integral",
    cantidad: 0.5,
    unidad: "kg",
    fechaEntrada: "2025-11-15",
    fechaCaducidad: "2026-03-01",
    categoria: "Cereales",
    nota: "Base para varios platos",
    frecuenciaDias: 10,
    proximaNecesidad: "2025-12-10",
    precioEstimado: 6000,
  },
  {
    id: 4,
    nombre: "Pechuga de pollo",
    cantidad: 0.4,
    unidad: "kg",
    fechaEntrada: "2025-11-25",
    fechaCaducidad: "2025-11-29",
    categoria: "Proteínas",
    nota: "Congelada",
    frecuenciaDias: 7,
    proximaNecesidad: "2025-12-02",
    precioEstimado: 14000,
  },
  {
    id: 5,
    nombre: "Tomates",
    cantidad: 2,
    unidad: "unidades",
    fechaEntrada: "2025-11-26",
    fechaCaducidad: "2025-11-30",
    categoria: "Verduras",
    nota: "",
    frecuenciaDias: 4,
    proximaNecesidad: "2025-11-29",
    precioEstimado: 1200,
  },
];

let historialCompras = [
  {
    id: 1,
    producto: "Leche deslactosada",
    cantidad: 2,
    precio: 11000,
    fecha: "2025-11-10",
    tienda: "Supermercado A",
  },
  {
    id: 2,
    producto: "Huevos",
    cantidad: 12,
    precio: 18000,
    fecha: "2025-11-12",
    tienda: "Plaza de mercado",
  },
  {
    id: 3,
    producto: "Arroz integral",
    cantidad: 1,
    precio: 12000,
    fecha: "2025-11-15",
    tienda: "Supermercado B",
  },
];

let menusBase = [
  {
    id: 1,
    nombre: "Pasta con salsa de tomate",
    dificultad: "Fácil",
    tiempo: "20 min",
    ingredientes: [
      "Pasta",
      "Tomates",
      "Aceite de oliva",
      "Sal",
      "Ajo",
    ],
    pasos: "Cocinar la pasta, saltear tomates con ajo y mezclar.",
  },
  {
    id: 2,
    nombre: "Arroz con pollo",
    dificultad: "Media",
    tiempo: "35 min",
    ingredientes: ["Arroz integral", "Pechuga de pollo", "Cebolla", "Zanahoria"],
    pasos: "Sellar el pollo, agregar vegetales, añadir arroz y cocinar.",
  },
  {
    id: 3,
    nombre: "Huevos revueltos con tomate",
    dificultad: "Fácil",
    tiempo: "10 min",
    ingredientes: ["Huevos", "Tomates", "Sal", "Pimienta"],
    pasos: "Batir huevos, agregar tomates picados y cocinar en sartén.",
  },
];

// Lista de compra actual (simulada)
let listaCompraActual = [];

// =======================
// Utilidades de fechas
// =======================

function hoyISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function diasEntre(fecha1, fecha2) {
  const d1 = new Date(fecha1);
  const d2 = new Date(fecha2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// =======================
// Lógica de inventario
// =======================

function obtenerProximosAVencer(diasUmbral = 3) {
  const hoy = hoyISO();
  return inventario.filter((prod) => {
    if (!prod.fechaCaducidad) return false;
    const dias = diasEntre(hoy, prod.fechaCaducidad);
    return dias >= 0 && dias <= diasUmbral;
  });
}

function obtenerStockBajo() {
  // Regla simple: si cantidad < 1 (unidad o kg) => stock bajo
  return inventario.filter((prod) => prod.cantidad < 1);
}

function agregarProducto(datos) {
  const nuevoId = inventario.length
    ? Math.max(...inventario.map((p) => p.id)) + 1
    : 1;
  const producto = {
    id: nuevoId,
    nombre: datos.nombre,
    cantidad: Number(datos.cantidad),
    unidad: datos.unidad,
    fechaEntrada: datos.fechaEntrada,
    fechaCaducidad: datos.fechaCaducidad || "",
    categoria: datos.categoria || "Otros",
    nota: datos.nota || "",
    frecuenciaDias: 7,
    proximaNecesidad: datos.fechaCaducidad || hoyISO(),
    precioEstimado: 5000,
  };
  inventario.push(producto);
  return producto;
}

function editarProducto(id, datos) {
  const idx = inventario.findIndex((p) => p.id === id);
  if (idx === -1) return;
  inventario[idx] = {
    ...inventario[idx],
    ...datos,
    cantidad: Number(datos.cantidad),
  };
}

function eliminarProducto(id) {
  inventario = inventario.filter((p) => p.id !== id);
}

// =======================
// Lógica lista de compra
// =======================

function generarListaCompra(modo = "balance") {
  // Regla simple:
  // - Si proximaNecesidad está en el pasado o cantidad < 1 → sugerir compra.
  const hoy = hoyISO();
  const sugeridos = [];

  inventario.forEach((prod) => {
    const dias = diasEntre(hoy, prod.proximaNecesidad);
    if (dias <= 0 || prod.cantidad < 1) {
      let cantidadSugerida = 1;
      if (modo === "completo") {
        cantidadSugerida = 2;
      } else if (modo === "ahorro") {
        cantidadSugerida = 0.5;
      }

      const precioUnitario =
        modo === "ahorro"
          ? Math.round(prod.precioEstimado * 0.9)
          : modo === "completo"
          ? Math.round(prod.precioEstimado * 1.1)
          : prod.precioEstimado;

      sugeridos.push({
        id: prod.id,
        nombre: prod.nombre,
        cantidadSugerida,
        unidad: prod.unidad,
        precioUnitario,
        modo,
        estado: "pendiente", // comprado, omitido
      });
    }
  });

  listaCompraActual = sugeridos;
  return listaCompraActual;
}

function calcularTotalLista() {
  return listaCompraActual.reduce(
    (acum, item) => acum + item.cantidadSugerida * item.precioUnitario,
    0
  );
}

function marcarItemLista(idProducto, estado) {
  const item = listaCompraActual.find((i) => i.id === idProducto);
  if (!item) return;
  item.estado = estado;

  if (estado === "comprado") {
    // Simulamos que se agrega al historial
    historialCompras.push({
      id: historialCompras.length + 1,
      producto: item.nombre,
      cantidad: item.cantidadSugerida,
      precio: item.precioUnitario * item.cantidadSugerida,
      fecha: hoyISO(),
      tienda: "Supermercado simulado",
    });
  }
}

// =======================
// Lógica menús
// =======================

function calcularDisponibilidadIngredientes(ingredientes) {
  const total = ingredientes.length;
  let disponibles = 0;

  ingredientes.forEach((ing) => {
    const existe = inventario.some((prod) =>
      prod.nombre.toLowerCase().trim() === ing.toLowerCase().trim()
    );
    if (existe) disponibles++;
  });

  return Math.round((disponibles / total) * 100);
}


function obtenerIngredientesFaltantes(ingredientes) {
  return ingredientes.filter((ing) => {
    const existe = inventario.some((prod) =>
      prod.nombre.toLowerCase().trim() === ing.toLowerCase().trim()
    );
    return !existe;
  });
}


function generarMenusSugeridos() {
  return menusBase.map((menu) => {
    const disponibilidad = calcularDisponibilidadIngredientes(menu.ingredientes);
    const faltantes = obtenerIngredientesFaltantes(menu.ingredientes);
    return {
      ...menu,
      disponibilidad,
      faltantes,
    };
  });
}

function usarIngredientesDeMenu(menuId) {
  // Simulación simple: reducimos la cantidad de los productos relacionados
  const menu = menusBase.find((m) => m.id === menuId);
  if (!menu) return;
  menu.ingredientes.forEach((ing) => {
    const prod = inventario.find((p) =>
      p.nombre.toLowerCase().includes(ing.toLowerCase())
    );
    if (prod) {
      prod.cantidad = Math.max(0, prod.cantidad - 1);
    }
  });
}

// =======================
// Simulaciones avanzadas
// =======================

function simularOCR() {
  return [
    {
      producto: "Leche deslactosada",
      cantidad: 1,
      precio: 5900,
      tienda: "Supermercado simulado",
      fecha: hoyISO(),
    },
    {
      producto: "Pan integral",
      cantidad: 1,
      precio: 5200,
      tienda: "Supermercado simulado",
      fecha: hoyISO(),
    },
  ];
}

function aplicarResultadosOCR(items) {
  items.forEach((item) => {
    historialCompras.push({
      id: historialCompras.length + 1,
      producto: item.producto,
      cantidad: item.cantidad,
      precio: item.precio,
      fecha: item.fecha,
      tienda: item.tienda,
    });
  });
}

function simularReconocimientoFoto() {
  return [
    { nombre: "Manzanas", cantidad: 4, unidad: "unidades" },
    { nombre: "Zanahorias", cantidad: 3, unidad: "unidades" },
  ];
}

function simularComparacionPrecios(nombreProducto) {
  return {
    producto: nombreProducto,
    opciones: [
      { tienda: "Super Online", precio: 5800 },
      { tienda: "Tienda de barrio", precio: 6000 },
      { tienda: "Mercado local", precio: 5500 },
    ],
    mejorOpcion: "Mercado local",
  };
}
