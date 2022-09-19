const router = require('express').Router()
const PetController = require('../controllers/PetController')

//Middlewares
//Apenas usuários autenticados poderão adicionar pets
const verifyToken = require('../helpers/verify-token')

//Upload de images
const { imageUpload } = require('../helpers/image-upload')


router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)

//Rota que vai pegar todos os pets para exibir na home do front-end
router.get("/", PetController.getAll)

module.exports = router