const express = require("express");
const {
  prepararAreaProductos,
  validarProducto,
} = require("../middleware/productos");
function crearRouterProductos(controladorProductos) {
  const router = express.Router();
  router.use(prepararAreaProductos);
  router.get("/", controladorProductos.listar);
  router.get("/nuevo", controladorProductos.mostrarFormulario);
  router.get("/:id/editar", controladorProductos.mostrarEdicion);
  router.post("/:id/editar", controladorProductos.guardarEdicion);
  router.get("/:id", controladorProductos.mostrarDetalle);
  router.post("/", validarProducto, controladorProductos.crear);
  router.get("/:id/disponibilidad", controladorProductos.mostrarCambioParcial);
  router.post("/:id/disponibilidad", controladorProductos.guardarCambioParcial);
  router.get("/:id/eliminar", controladorProductos.mostrarEliminacion);
  router.post("/:id/eliminar", controladorProductos.eliminarWeb);

  return router;
}
module.exports = { crearRouterProductos };
