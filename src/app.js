require("dotenv").config();
const express = require('express');
const session = require("express-session")
const methodOverride = require("method-override");
const path = require('path');

const userLoggedMiddleware = require('./Middlewares/userLoggedMiddleware');
const homeRoutes = require('./Routes/homeRoutes');
const practicaRoutes = require('./Routes/practicaRoutes');
const inscripcionRoutes = require('./Routes/inscripcionRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const alumnoRoutes = require('./Routes/alumnoRoutes');
const profesorRoutes = require('./Routes/profesorRoutes');
const authRoutes = require('./Routes/authRoutes');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use(methodOverride("_method"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'Public')));
app.use(session({
    secret:"Esto es un secreto",
    resave: false,
    saveUninitialized: false
}))
app.use(userLoggedMiddleware);


app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/practicas', practicaRoutes);
app.use('/inscripcion', inscripcionRoutes);
app.use('/admin', adminRoutes);
app.use('/alumno', alumnoRoutes);
app.use('/profesor', profesorRoutes);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
