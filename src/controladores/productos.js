function crearControladorProductos(servicio) {
  async function listar(req, res) {
    const productos = await servicio.listar();
    res.render("productos/lista", {
      titulo: "Productos artesanales",
      productos,
    });
  }
  function mostrarFormulario(req, res) {
    res.render("productos/nuevo", {
      titulo: "Nuevo producto",
      error: null,
      valores: {},
    });
  }
  async function mostrarDetalle(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Producto no encontrado",
        mensaje: "No existe un producto con ese identificador.",
      });
    }
    res.render("productos/detalle", { titulo: producto.nombre, producto });
  }
  async function crear(req, res) {
    await servicio.crear(req.productoValidado);
    res.redirect("/productos");
  }
  async function mostrarEdicion(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Producto no encontrado",
        mensaje: "No existe el producto que querés editar.",
      });
    }
    res.render("productos/editar", {
      titulo: "Editar producto",
      error: null,
      id: producto.id,
      valores: { ...producto, disponible: String(producto.disponible) },
    });
  }
  async function guardarEdicion(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Producto no encontrado",
        mensaje: "El producto ya no existe. No se guardaron cambios.",
      });
    }
    const datos = req.body ?? {};
    const valores = {
      nombre: typeof datos.nombre === "string" ? datos.nombre : "",
      categoria: typeof datos.categoria === "string" ? datos.categoria : "",
      precio: typeof datos.precio === "string" ? datos.precio : "",
      descripcion:
        typeof datos.descripcion === "string" ? datos.descripcion : "",
      disponible: typeof datos.disponible === "string" ? datos.disponible : "",
    };
    const permitidos = [
      "nombre",
      "categoria",
      "precio",
      "descripcion",
      "disponible",
    ];
    let hayCamposExtra = false;
    for (const campo of Object.keys(datos)) {
      if (!permitidos.includes(campo)) hayCamposExtra = true;
    }
    const precio = valores.precio.trim() === "" ? NaN : Number(valores.precio);
    const disponibilidadValida =
      valores.disponible === "true" || valores.disponible === "false";
    if (
      hayCamposExtra ||
      !valores.nombre.trim() ||
      !valores.categoria.trim() ||
      !valores.descripcion.trim() ||
      !Number.isFinite(precio) ||
      precio < 1 ||
      !disponibilidadValida
    ) {
      return res.status(400).render("productos/editar", {
        titulo: "Editar producto",
        error:
          "Completá los textos, un precio de al menos 1 y la disponibilidad.",
        id: producto.id,
        valores,
      });
    }
    res.locals.formularioEdicion = { id: producto.id, valores };
    const reemplazo = {
      nombre: valores.nombre.trim(),
      categoria: valores.categoria.trim(),
      precio,
      descripcion: valores.descripcion.trim(),
      disponible: valores.disponible === "true",
    };
    const actualizado = await servicio.reemplazar(producto.id, reemplazo);
    if (!actualizado) {
      return res.status(404).render("no-encontrado", {
        titulo: "Producto no encontrado",
        mensaje: "El producto ya no existe. No se guardaron cambios.",
      });
    }
    res.redirect(303, `/productos/${actualizado.id}`);
  }
  async function mostrarCambioParcial(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Recurso no encontrado",
        mensaje: "No existe el registro solicitado. No se guardaron cambios.",
      });
    }
    res.render("productos/disponibilidad", {
      titulo: "Cambiar disponibilidad",
      error: null,
      id: producto.id,
      valores: { disponible: String(producto.disponible) },
    });
  }
  async function guardarCambioParcial(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Recurso no encontrado",
        mensaje: "No existe el registro solicitado. No se guardaron cambios.",
      });
    }
    const datos = req.body ?? {};
    const valores = {
      disponible: typeof datos.disponible === "string" ? datos.disponible : "",
    };
    const campoValido =
      valores.disponible === "true" || valores.disponible === "false";
    if (Object.keys(datos).length !== 1 || !campoValido) {
      return res.status(400).render("productos/disponibilidad", {
        titulo: "Cambiar disponibilidad",
        error: "Enviá únicamente disponible con una de las opciones indicadas.",
        id: producto.id,
        valores,
      });
    }
    res.locals.formularioParcial = { id: producto.id, valores };
    const cambios = { disponible: valores.disponible === "true" };
    const actualizado = await servicio.actualizar(producto.id, cambios);
    if (!actualizado) {
      return res.status(404).render("no-encontrado", {
        titulo: "Recurso no encontrado",
        mensaje: "No existe el registro solicitado. No se guardaron cambios.",
      });
    }
    res.redirect(303, `/productos/${actualizado.id}`);
  }
  async function mostrarEliminacion(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Recurso no encontrado",
        mensaje: "No existe el registro solicitado. No se guardaron cambios.",
      });
    }
    res.render("productos/eliminar", {
      titulo: "Confirmar eliminación",
      error: null,
      producto,
    });
  }
  async function eliminarWeb(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Recurso no encontrado",
        mensaje: "No existe el registro solicitado. No se guardaron cambios.",
      });
    }
    const datos = req.body ?? {};
    if (Object.keys(datos).length !== 1 || datos.confirmar !== "si") {
      return res.status(400).render("productos/eliminar", {
        titulo: "Confirmar eliminación",
        error: "La eliminación requiere confirmar desde este formulario.",
        producto,
      });
    }
    const eliminado = await servicio.eliminar(producto.id);
    if (!eliminado) {
      return res.status(404).render("no-encontrado", {
        titulo: "Recurso no encontrado",
        mensaje: "No existe el registro solicitado. No se guardaron cambios.",
      });
    }
    res.redirect(303, "/productos");
  }
  // NUEVA FUNCIÓN ESPECÍFICA PARA LA API
  async function crearApi(req, res) {
    try {
      // 1. Guardamos el producto utilizando el servicio
      const productoGuardado = await servicio.crear(req.productoValidado);

      // Obtenemos el ID generado (puede ser _id o id dependiendo de tu base de datos)
      const id = productoGuardado._id || productoGuardado.id;

      // 2. Respondemos con status 201, el header Location y el JSON del producto
      res
        .status(201)
        .header("Location", `/api/productos/${id}`)
        .json(productoGuardado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  async function eliminarApi(req, res) {
    const eliminado = await servicio.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.status(204).end();
  }

  async function listarApi(req, res) {
    const permitidos = ["categoria", "orden"];
    for (const campo of Object.keys(req.query)) {
      if (!permitidos.includes(campo)) {
        return res.status(400).json({ error: "Parámetro no permitido." });
      }
    }
    const categoria = req.query.categoria;
    if (categoria !== undefined) {
      if (typeof categoria !== "string" || categoria.trim() === "") {
        return res
          .status(400)
          .json({ error: "El texto de categoría debe tener contenido." });
      }
    }
    let orden = "nombre";
    if (req.query.orden !== undefined) {
      orden = req.query.orden;
      if (
        orden !== "nombre" &&
        orden !== "precio-asc" &&
        orden !== "precio-desc"
      ) {
        return res.status(400).json({ error: "Orden no permitido." });
      }
    }
    const resultado = await servicio.consultar(categoria, orden);
    res.json(resultado);
  }
  async function obtenerApi(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }
    res.json(producto);
  }
  async function reemplazarApi(req, res) {
    const producto = await servicio.reemplazar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!producto) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.json(producto);
  }
  async function actualizarApi(req, res) {
    const producto = await servicio.actualizar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!producto) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.json(producto);
  }

  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    mostrarEdicion,
    guardarEdicion,
    mostrarCambioParcial,
    guardarCambioParcial,
    mostrarEliminacion,
    eliminarWeb,
    listarApi,
    obtenerApi,
    crearApi,
    eliminarApi,
    reemplazarApi,
    actualizarApi,
  };
}
module.exports = { crearControladorProductos };
