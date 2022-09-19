const Pet = require('../models/Pet')

//Helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class PetController {

    //Criar um pet
    static async create(req, res) {
        
        const {name, age, weight, color} = req.body

        const images = req.files

        const available = true

        //Upload de imagens

        //Validações
        if(!name) {
            res.status(422).json({message: "O nome do pet é obrigatório"})
            return
        }

        if(!age) {
            res.status(422).json({message: "A idade do pet é obrigatória"})
            return
        }

        if(!weight) {
            res.status(422).json({message: "O peso do pet é obrigatório"})
            return
        }

        if(!color) {
            res.status(422).json({message: "A cor do pet é obrigatória"})
            return
        }

        if(images.length === 0) {
            res.status(422).json({message: "A imagem do pet é obrigatória"})
            return
        }

        //Pegando o usuário dono do pet para poder adicionar ao pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        //Criando um pet
        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        })

        images.map((image) => {
           pet.images.push(image.filename)
        })

        //Salvar o pet no banco de dados
        try {

            const newPet = await pet.save()
            res.status(201).json({
                message: "Pet cadastrado com sucesso",
                newPet,
            })

        } catch(error) {
            res.status(500).json({message: error})
        }
    }

    
    //Função para pegar todos os pets
    static async getAll(req, res) {

        //Pegando os pets do mais novo ao mais velho cadastrado
        const pets = await Pet.find().sort('-createdAt')

        res.status(200).json({pets: pets})
    }

    //Função para pegar todos os pets de um usuário para ser exibido na dashboard
    static async getAllUserPets(req, res) {

        //Pegar o usuário pelo token
        const token = getToken(req)
        const user = await getUserByToken(token)

        //Pegar os pets cadastrados pelo usuário (filtrando pelo ID)
        const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')

        res.status(200).json({pets})

    }

    //Função para pegar todos os pets que o usuários tem interesse em adotar
    static async getAllUserAdoptions(req, res) {

        //Pegar o usuário pelo token
        const token = getToken(req)
        const user = await getUserByToken(token)

        //Pegar os pets que o usuários tem interesse em adotar
        const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')

        res.status(200).json({pets})

    }

    //Função para pegar um pet pelo ID
    static async getPetById(req, res) {

        const id = req.params.id

        if(!ObjectId.isValid(id)) {
            res.status(422).json({ message: "O ID não é valido" })
            return
        }

        //Checa se o pet existe
        const pet = await Pet.findOne({_id: id})

        if(!pet) {
            res.status(404).json({ message: "Pet não encontrado" })
        }

        //Retorna o pet encontrado pelo ID e envia para o front-end
        res.status(200).json({pet: pet})

    }

    //Função para remover um Pet cadastrado
    static async removePetById(req, res) {

        const id = req.params.id

        //Checando se o ID é válido
        if(!ObjectId.isValid(id)) {
            res.status(422).json({ message: "O ID não é valido" })
            return
        }

        //Checa se o pet existe
        const pet = await Pet.findOne({_id: id})

        if(!pet) {
            res.status(404).json({ message: "Pet não encontrado" })
            return
        }

        //Checar se o usuário logado foi quem registrou o pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "Houve um problema ao processar a sua solicitação" })
            return
        }

        await Pet.findByIdAndRemove(id)

        res.status(200).json({ message: 'Pet removido com sucesso' })

    }

    //Função para editar um pet
    static async updatePet(req, res) {

        const id = req.params.id

        const { name, age, weight, color, available } = req.body
        
        const images = req.files

        //Onde vai ficar os dados atualizados
        const updateData = {}

        //Checar se o pet existe
        const pet = await Pet.findOne({_id: id})

        if(!pet) {
            res.status(404).json({ message: "Pet não encontrado" })
            return
        }

        //Checar se o usuário logado foi quem registrou o pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "Houve um problema ao processar a sua solicitação" })
            return
        }

        if(!name) {
            res.status(422).json({message: "O nome do pet é obrigatório"})
            return
        } else {
            updateData.name = name
        }

        if(!age) {
            res.status(422).json({message: "A idade do pet é obrigatória"})
            return
        } else {
            updateData.age = age
        }

        if(!weight) {
            res.status(422).json({message: "O peso do pet é obrigatório"})
            return
        } else {
            updateData.weight = weight
        }

        if(!color) {
            res.status(422).json({message: "A cor do pet é obrigatória"})
            return
        } else {
            updateData.color = color
        }

        if(images.length === 0) {
            res.status(422).json({message: "A imagem do pet é obrigatória"})
            return
        } else {
            updateData.images = []
            images.map((image) => {
                updateData.images.push(image.filename)
            })
        }

        await Pet.findByIdAndUpdate(id, updateData)

        res.status(200).json({message: 'Pet atualizado com sucesso'})
    }

}