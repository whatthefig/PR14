const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const cardsRout = require('./routes/cards');
const userRout = require('./routes/users');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');

const app = express();
app.use(cookieParser());

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.get('/posts', (req, res) => console.log(`Токен: ${req.cookies.jwt}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/signup', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
    avatar: Joi.string().uri(),
    about: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), createUser);
app.post('/signin', login);

app.use(auth);

app.use('/', userRout);
app.use('/', cardsRout);
app.use((req, res) => res.status(404).send({ message: 'Запрашиваемый ресурс не найден' }));

app.listen(PORT, () => console.log(`Используется порт ${PORT}`));
