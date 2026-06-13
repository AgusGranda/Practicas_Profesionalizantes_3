function agregarCuposDisponibles(practicas) {
  const lista = Array.isArray(practicas) ? practicas : [practicas];

  lista.forEach(practica => {
    const inscripcionesActivas = practica.inscripciones
      ? practica.inscripciones.length
      : 0;
    const disponibles = Math.max(0, practica.cupo - inscripcionesActivas);

    practica.setDataValue('cuposDisponibles', disponibles);
  });

  return practicas;
}

module.exports = {
  agregarCuposDisponibles
};
