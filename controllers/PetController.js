const Pet = require('../models/Pet')

//Helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

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

}