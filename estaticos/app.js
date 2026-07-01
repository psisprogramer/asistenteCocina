// estaticos/app.js

// ---------------
// Navegación
// ---------------

const navButtons = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;

    navButtons.forEach((b) => b.classList.remove("active"));
    sections.forEach((sec) => sec.classList.remove("visible"));

    btn.classList.add("active");
    document.getElementById(target).classList.add("visible");
  });
});

// Acciones rápidas desde dashboard
document.getElementById("btn-ir-lista").addEventListener("click", () => {
  document.querySelector('[data-section="lista"]').click();
});
document.getElementById("btn-ir-menus").addEventListener("click", () => {
  document.querySelector('[data-section="menus"]').click();
});

// ---------------
// Onboarding
// ---------------

const onboardingModal = document.getElementById("onboarding-modal");
const onboardingForm = document.getElementById("onboarding-form");
const topbarHogar = document.getElementById("topbar-hogar");
const topbarPresupuesto = document.getElementById("topbar-presupuesto");

function actualizarTopbar() {
  topbarHogar.textContent = `Hogar: ${ajustes.tamanoHogar} persona(s)`;
  topbarPresupuesto.textContent = `Presupuesto: $${ajustes.presupuestoCompra.toLocaleString(
    "es-CO"
  )}`;
}

onboardingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const tamano = Number(document.getElementById("tamano-hogar").value || 1);
  const alergiasTexto = document.getElementById("alergias").value.trim();
  const presupuesto = Number(
    document.getElementById("presupuesto-monto").value || 0
  );

  ajustes.tamanoHogar = tamano;
  ajustes.alergias = alergiasTexto
    ? alergiasTexto.split(",").map((a) => a.trim())
    : [];
  ajustes.presupuestoCompra = presupuesto;

  onboardingModal.style.display = "none";
  actualizarTopbar();
  renderDashboard();
  renderInventario();
  renderHistorial();
  renderMenus();
});

// ---------------
// Dashboard
// ---------------

function renderDashboard() {
  const proximosUl = document.getElementById("lista-proximos-vencer");
  const stockBajoUl = document.getElementById("lista-stock-bajo");
  const resumenGasto = document.getElementById("resumen-gasto-lista");

  const proximos = obtenerProximosAVencer();
  proximosUl.innerHTML = "";
  if (proximos.length === 0) {
    proximosUl.innerHTML = "<li>No hay productos próximos a vencer.</li>";
  } else {
    proximos.forEach((prod) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${prod.nombre}</strong> - vence el <span class="text-danger">${prod.fechaCaducidad}</span>`;
      proximosUl.appendChild(li);
    });
  }

  const stockBajo = obtenerStockBajo();
  stockBajoUl.innerHTML = "";
  if (stockBajo.length === 0) {
    stockBajoUl.innerHTML = "<li>No hay productos con stock bajo.</li>";
  } else {
    stockBajo.forEach((prod) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${prod.nombre}</strong> - ${prod.cantidad} ${prod.unidad}`;
      stockBajoUl.appendChild(li);
    });
  }

  if (listaCompraActual.length === 0) {
    resumenGasto.textContent = "No hay lista generada aún.";
  } else {
    const total = calcularTotalLista();
    const excede = total > ajustes.presupuestoCompra;
    resumenGasto.innerHTML = `
      Total estimado: <strong>$${total.toLocaleString("es-CO")}</strong><br />
      Presupuesto: <strong>$${ajustes.presupuestoCompra.toLocaleString(
        "es-CO"
      )}</strong><br />
      ${
        excede
          ? '<span class="text-danger">La lista excede el presupuesto.</span>'
          : "La lista está dentro del presupuesto."
      }
    `;
  }
}

// ---------------
// Inventario
// ---------------

const inventarioContenedor = document.getElementById("inventario-contenedor");
const btnAgregarProducto = document.getElementById("btn-agregar-producto");
const btnVerListaInv = document.getElementById("btn-ver-lista-inventario");
const btnVerTarjetasInv = document.getElementById("btn-ver-tarjetas-inventario");
const selectOrdenInventario = document.getElementById("orden-inventario");

let modoInventario = "lista"; // o "tarjetas"

btnVerListaInv.addEventListener("click", () => {
  modoInventario = "lista";
  renderInventario();
});

btnVerTarjetasInv.addEventListener("click", () => {
  modoInventario = "tarjetas";
  renderInventario();
});

selectOrdenInventario.addEventListener("change", renderInventario);

function ordenarInventario() {
  const criterio = selectOrdenInventario.value;
  const copia = [...inventario];
  copia.sort((a, b) => {
    if (criterio === "nombre") {
      return a.nombre.localeCompare(b.nombre);
    }
    if (criterio === "caducidad") {
      return (a.fechaCaducidad || "").localeCompare(b.fechaCaducidad || "");
    }
    if (criterio === "cantidad") {
      return a.cantidad - b.cantidad;
    }
    if (criterio === "categoria") {
      return (a.categoria || "").localeCompare(b.categoria || "");
    }
    return 0;
  });
  return copia;
}

function renderInventario() {
  const listaOrdenada = ordenarInventario();
  inventarioContenedor.innerHTML = "";

  if (modoInventario === "lista") {
    inventarioContenedor.className = "inventario-lista";
    listaOrdenada.forEach((prod) => {
      const div = document.createElement("div");
      div.className = "inventario-item";
      const cad = prod.fechaCaducidad || "N/A";
      div.innerHTML = `
        <div>
          <strong>${prod.nombre}</strong><br/>
          <span class="tag">${prod.categoria}</span>
        </div>
        <div>${prod.cantidad} ${prod.unidad}</div>
        <div>${prod.fechaEntrada}</div>
        <div>$${prod.precioEstimado.toLocaleString("es-CO")}</div>
        <div>
          <button class="btn btn-xs" data-accion="editar" data-id="${prod.id}">Editar</button>
          <button class="btn btn-xs" data-accion="eliminar" data-id="${prod.id}">Eliminar</button>
        </div>
      `;
      inventarioContenedor.appendChild(div);
    });
  } else {
    inventarioContenedor.className = "inventario-tarjetas";
    listaOrdenada.forEach((prod) => {
      const card = document.createElement("div");
      card.className = "inventario-card";
      const cad = prod.fechaCaducidad || "N/A";
      const proximos = obtenerProximosAVencer().some((p) => p.id === prod.id);
      card.innerHTML = `
        <div class="flex">
          <h4>${prod.nombre}</h4>
          ${proximos ? '<span class="tag badge-danger">Próximo a vencer</span>' : ""}
        </div>
        <p>${prod.cantidad} ${prod.unidad} · <span class="tag">${prod.categoria}</span></p>
        <p>Entrada: ${prod.fechaEntrada} · Caduca: ${cad}</p>
        <p>Próxima necesidad estimada: ${prod.proximaNecesidad}</p>
        <p>Precio estimado: $${prod.precioEstimado.toLocaleString("es-CO")}</p>
        <div style="display:flex; gap:0.4rem; margin-top:0.4rem;">
          <button class="btn btn-xs" data-accion="editar" data-id="${prod.id}">Editar</button>
          <button class="btn btn-xs" data-accion="eliminar" data-id="${prod.id}">Eliminar</button>
        </div>
      `;
      inventarioContenedor.appendChild(card);
    });
  }

  // Delegación eventos editar/eliminar
  inventarioContenedor.querySelectorAll("[data-accion]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const accion = btn.dataset.accion;
      const id = Number(btn.dataset.id);
      if (accion === "editar") {
        abrirModalProducto(id);
      } else if (accion === "eliminar") {
        if (confirm("¿Eliminar este producto del inventario?")) {
          eliminarProducto(id);
          renderInventario();
          renderDashboard();
        }
      }
    });
  });

  renderDashboard();
}

// ---------------
// Modal producto
// ---------------

const modalProductoBackdrop = document.getElementById("modal-producto-backdrop");
const modalProductoTitulo = document.getElementById("modal-producto-titulo");
const formProducto = document.getElementById("form-producto");
const btnCancelarProducto = document.getElementById("btn-cancelar-producto");

btnAgregarProducto.addEventListener("click", () => abrirModalProducto());

btnCancelarProducto.addEventListener("click", () => {
  modalProductoBackdrop.classList.add("hidden");
});

function abrirModalProducto(idProducto) {
  formProducto.reset();
  document.getElementById("producto-id").value = idProducto || "";
  if (idProducto) {
    modalProductoTitulo.textContent = "Editar producto";
    const prod = inventario.find((p) => p.id === idProducto);
    if (prod) {
      document.getElementById("producto-nombre").value = prod.nombre;
      document.getElementById("producto-cantidad").value = prod.cantidad;
      document.getElementById("producto-unidad").value = prod.unidad;
      document.getElementById("producto-fecha-entrada").value = prod.fechaEntrada;
      document.getElementById("producto-fecha-caducidad").value =
        prod.fechaCaducidad || "";
      document.getElementById("producto-categoria").value = prod.categoria;
      document.getElementById("producto-nota").value = prod.nota;
    }
  } else {
    modalProductoTitulo.textContent = "Agregar producto";
  }
  modalProductoBackdrop.classList.remove("hidden");
}

formProducto.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("producto-id").value;
  const datos = {
    nombre: document.getElementById("producto-nombre").value,
    cantidad: document.getElementById("producto-cantidad").value,
    unidad: document.getElementById("producto-unidad").value,
    fechaEntrada: document.getElementById("producto-fecha-entrada").value,
    fechaCaducidad: document.getElementById("producto-fecha-caducidad").value,
    categoria: document.getElementById("producto-categoria").value,
    nota: document.getElementById("producto-nota").value,
  };

  if (id) {
    editarProducto(Number(id), datos);
  } else {
    agregarProducto(datos);
  }

  modalProductoBackdrop.classList.add("hidden");
  renderInventario();
  renderDashboard();
});

// ---------------
// Lista de compra
// ---------------

const btnListaBalance = document.getElementById("btn-generar-lista-balance");
const btnListaAhorro = document.getElementById("btn-generar-lista-ahorro");
const btnListaCompleto = document.getElementById("btn-generar-lista-completo");
const listaCompraItems = document.getElementById("lista-compra-items");
const listaPresupuestoResumen = document.getElementById(
  "lista-presupuesto-resumen"
);

btnListaBalance.addEventListener("click", () => {
  generarLista("balance");
});
btnListaAhorro.addEventListener("click", () => {
  generarLista("ahorro");
});
btnListaCompleto.addEventListener("click", () => {
  generarLista("completo");
});

function generarLista(modo) {
  generarListaCompra(modo);
  renderListaCompra();
  renderDashboard();
}

function renderListaCompra() {
  listaCompraItems.innerHTML = "";
  if (listaCompraActual.length === 0) {
    listaCompraItems.innerHTML =
      "<li>No hay productos sugeridos en la lista.</li>";
    listaPresupuestoResumen.textContent = "";
    return;
  }

  const total = calcularTotalLista();
  const excede = total > ajustes.presupuestoCompra;

  listaPresupuestoResumen.innerHTML = `
    Total estimado: <strong>$${total.toLocaleString("es-CO")}</strong> · 
    Presupuesto: <strong>$${ajustes.presupuestoCompra.toLocaleString(
      "es-CO"
    )}</strong> · 
    ${
      excede
        ? '<span class="text-danger">Excede el presupuesto (prueba modo Ahorro).</span>'
        : "Dentro del presupuesto."
    }
  `;

  listaCompraActual.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br/>
        <span class="tag">${item.modo}</span>
      </div>
      <div>${item.cantidadSugerida} ${item.unidad}</div>
      <div>$${item.precioUnitario.toLocaleString("es-CO")}</div>
      <div style="display:flex; gap:0.3rem;">
        <button class="btn btn-xs" data-estado="comprado" data-id="${item.id}">Comprado</button>
        <button class="btn btn-xs" data-estado="omitido" data-id="${item.id}">Omitir</button>
      </div>
    `;
    listaCompraItems.appendChild(li);
  });

  listaCompraItems.querySelectorAll("[data-estado]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const estado = btn.dataset.estado;
      const id = Number(btn.dataset.id);
      marcarItemLista(id, estado);
      renderListaCompra();
      renderHistorial();
      renderDashboard();
    });
  });
}

// ---------------
// Menús
// ---------------

const menusContenedor = document.getElementById("menus-contenedor");

function renderMenus() {
  const menus = generarMenusSugeridos();
  menusContenedor.innerHTML = "";

  menus.forEach((menu) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${menu.nombre}</h3>
      <p>${menu.dificultad} · ${menu.tiempo}</p>
      <p>Disponibilidad ingredientes: <strong>${menu.disponibilidad}%</strong></p>
      <p>Ingredientes: ${menu.ingredientes.join(", ")}</p>
      ${
        menu.faltantes.length
          ? `<p class="text-danger">Faltantes: ${menu.faltantes.join(
              ", "
            )}</p>`
          : "<p>Todos los ingredientes están disponibles.</p>"
      }
      <div class="quick-actions">
        <button class="btn btn-xs" data-accion="usar" data-id="${menu.id}">
          Usar ingredientes
        </button>
        ${
          menu.faltantes.length
            ? `<button class="btn btn-xs" data-accion="agregar-faltantes" data-id="${menu.id}">
                Añadir faltantes a lista
              </button>`
            : ""
        }
      </div>
      <details style="margin-top:0.5rem;">
        <summary>Ver pasos</summary>
        <p>${menu.pasos}</p>
      </details>
    `;
    menusContenedor.appendChild(card);
  });

  menusContenedor.querySelectorAll("[data-accion]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const accion = btn.dataset.accion;
      const id = Number(btn.dataset.id);
      if (accion === "usar") {
        usarIngredientesDeMenu(id);
        renderInventario();
        renderDashboard();
        renderMenus();
      } else if (accion === "agregar-faltantes") {
        const menu = generarMenusSugeridos().find((m) => m.id === id);
        if (menu && menu.faltantes.length) {
          // Agregamos los faltantes como sugerencias adicionales en la lista
          menu.faltantes.forEach((f) => {
            listaCompraActual.push({
              id: Date.now() + Math.random(),
              nombre: f,
              cantidadSugerida: 1,
              unidad: "unidades",
              precioUnitario: 5000,
              modo: "completo",
              estado: "pendiente",
            });
          });
          renderListaCompra();
          document.querySelector('[data-section="lista"]').click();
        }
      }
    });
  });
}

// ---------------
// Historial
// ---------------

const historialTbody = document.getElementById("historial-tbody");
const filtroProductoHistorial = document.getElementById(
  "filtro-producto-historial"
);
const filtroFechaHistorial = document.getElementById("filtro-fecha-historial");
const btnLimpiarFiltrosHistorial = document.getElementById(
  "btn-limpiar-filtros-historial"
);

filtroProductoHistorial.addEventListener("input", renderHistorial);
filtroFechaHistorial.addEventListener("change", renderHistorial);
btnLimpiarFiltrosHistorial.addEventListener("click", () => {
  filtroProductoHistorial.value = "";
  filtroFechaHistorial.value = "";
  renderHistorial();
});

function renderHistorial() {
  historialTbody.innerHTML = "";
  const texto = filtroProductoHistorial.value.toLowerCase();
  const fecha = filtroFechaHistorial.value;

  historialCompras
    .filter((item) => {
      const coincideProducto = item.producto
        .toLowerCase()
        .includes(texto || "");
      const coincideFecha = fecha ? item.fecha === fecha : true;
      return coincideProducto && coincideFecha;
    })
    .forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.fecha}</td>
        <td>${item.producto}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio.toLocaleString("es-CO")}</td>
        <td>${item.tienda}</td>
      `;
      historialTbody.appendChild(tr);
    });
}

// ---------------
// Ajustes + simulaciones
// ---------------

const ajustesForm = document.getElementById("ajustes-form");
const ajustesTamanoHogarInput = document.getElementById(
  "ajustes-tamano-hogar"
);
const ajustesAlergiasInput = document.getElementById("ajustes-alergias");
const ajustesPresupuestoInput = document.getElementById("ajustes-presupuesto");

const modalSimulacionBackdrop = document.getElementById(
  "modal-simulacion-backdrop"
);
const modalSimulacionTitulo = document.getElementById(
  "modal-simulacion-titulo"
);
const modalSimulacionContenido = document.getElementById(
  "modal-simulacion-contenido"
);
const btnModalSimulacionCerrar = document.getElementById(
  "btn-modal-simulacion-cerrar"
);
const btnModalSimulacionAplicar = document.getElementById(
  "btn-modal-simulacion-aplicar"
);

document.getElementById("btn-simular-ocr").addEventListener("click", () => {
  const resultados = simularOCR();
  modalSimulacionTitulo.textContent = "Simulación OCR de recibo";
  modalSimulacionContenido.textContent = JSON.stringify(
    resultados,
    null,
    2
  );
  btnModalSimulacionAplicar.classList.remove("hidden");
  btnModalSimulacionAplicar.onclick = () => {
    aplicarResultadosOCR(resultados);
    renderHistorial();
    modalSimulacionBackdrop.classList.add("hidden");
  };
  modalSimulacionBackdrop.classList.remove("hidden");
});

document.getElementById("btn-simular-foto").addEventListener("click", () => {
  const resultados = simularReconocimientoFoto();
  modalSimulacionTitulo.textContent = "Simulación reconocimiento por foto";
  modalSimulacionContenido.textContent = JSON.stringify(
    resultados,
    null,
    2
  );
  btnModalSimulacionAplicar.classList.add("hidden");
  modalSimulacionBackdrop.classList.remove("hidden");
});

document
  .getElementById("btn-simular-comparar-precios")
  .addEventListener("click", () => {
    const ejemplo = "Leche deslactosada";
    const resultados = simularComparacionPrecios(ejemplo);
    modalSimulacionTitulo.textContent = "Simulación comparación de precios";
    modalSimulacionContenido.textContent = JSON.stringify(
      resultados,
      null,
      2
    );
    btnModalSimulacionAplicar.classList.add("hidden");
    modalSimulacionBackdrop.classList.remove("hidden");
  });

btnModalSimulacionCerrar.addEventListener("click", () => {
  modalSimulacionBackdrop.classList.add("hidden");
});

ajustesForm.addEventListener("submit", (e) => {
  e.preventDefault();
  ajustes.tamanoHogar = Number(ajustesTamanoHogarInput.value || 1);
  ajustes.alergias = ajustesAlergiasInput.value
    ? ajustesAlergiasInput.value.split(",").map((a) => a.trim())
    : [];
  ajustes.presupuestoCompra = Number(ajustesPresupuestoInput.value || 0);
  actualizarTopbar();
  alert("Ajustes guardados.");
});

// Inicializar valores ajustes en formulario
function initAjustesForm() {
  ajustesTamanoHogarInput.value = ajustes.tamanoHogar;
  ajustesAlergiasInput.value = ajustes.alergias.join(", ");
  ajustesPresupuestoInput.value = ajustes.presupuestoCompra;
}

// ---------------
// Inicialización
// ---------------

window.addEventListener("DOMContentLoaded", () => {
  // Cargar ajustes por defecto
  actualizarTopbar();
  initAjustesForm();
  // Onboarding visible de entrada (ya está en HTML)
});
