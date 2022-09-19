const router = require('express').Router()
const PetController = require('../controllers/PetController')

//Middlewares
//Apenas usuários autenticados poderão adicionar pets
const verifyToken = require('../helpers/verify-token')

//Upload de images
const { imageUpload } = require('../helpers/image-upload')


router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)

//Rota que vai exibir todos os pets para exibir na home do front-end
router.get("/", PetController.getAll)

//Rota que vai exibir todos os pets que um usuário cadastrados para exibir na dashboard dele
router.get('/mypets', verifyToken, PetController.getAllUserPets)

//Rota que vai exibir todos os pets que o usuário tem interesse em adotar
router.get('/myadoptions', verifyToken, PetController.getAllUserAdoptions)

module.exports = router