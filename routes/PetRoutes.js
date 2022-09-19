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

//Rota para resgtar um pet pelo ID
router.get('/:id', PetController.getPetById)

//Rota para remover um pet
router.delete('/:id', verifyToken, PetController.removePetById)

//Rota de atualização do pet
router.patch('/:id', verifyToken, imageUpload.array('image'), PetController.updatePet)

//Rota para agendar visita
router.patch('/schedule/:id', verifyToken, PetController.schedule)

//Rota para concluir a adoção
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption)

module.exports = router