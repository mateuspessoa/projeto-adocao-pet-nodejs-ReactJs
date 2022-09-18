const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {

    static async register(req, res) {

        const {name, email, phone, password, confirmpassword} = req.body

        //Validações
        if(!name) {
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }

        if(!email) {
            res.status(422).json({ message: 'O email é obrigatório' })
            return
        }

        if(!phone) {
            res.status(422).json({ message: 'O telefone é obrigatório' })
            return
        }

        if(!password) {
            res.status(422).json({ message: 'A senha é obrigatório' })
            return
        }

        if(!confirmpassword) {
            res.status(422).json({ message: 'A confirmação da senha é obrigatório' })
            return
        }

        if(password !== confirmpassword) {
            res.status(422).json({ message: 'As senhas precisam ser iguais' })
            return
        }

        //Checar se o usuário existe
        const userExist = await User.findOne({email: email})

        if(userExist) {
            res.status(422).json({ message: 'Email já cadastrado!' })
            return
        }

        //Crição da senha criptografada
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //Criação do usuário
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash,
        })

        //Salvar o usuário no Banco de Dados
        try {

            const newUser = await user.save()
            
            //Passando o token que foi criado (serve para autenticar e logar o usuário após o registro)
            await createUserToken(newUser, req, res)

        } catch(error) {
            res.status(500).json({message: error})
        }
    }

    static async login(req, res) {

        const {email, password} = req.body

        //Validações
        if(!email) {
            res.status(422).json({ message: "Você não digitou um email" })
        }

        if(!password) {
            res.status(422).json({ message: "Você não digitou a senha" })
        }

        //Checar se o usuário existe
        const user = await User.findOne({email: email})

        if(!user) {
            res.status(422).json({ message: 'Usuário não cadastrado' })
            return
        }

        //Checar se a senha digitada é a mesma cadastrada no banco de dados
        const ckeckPassword = await bcrypt.compare(password, user.password)

        if(!ckeckPassword) {
            res.status(422).json({ message: 'A senha está incorreta' })
            return
        }

        await createUserToken(user, req, res)

    }

    //Função para capturar o usuário que está utilizando o sistema pelo token
    static async checkUser(req, res) {

        let currentUser


        //Local onde fica o token
        if(req.headers.authorization) {

            //Decodificar o token, extrair o id e limpar a senha que vem junto ao token
            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined

        } else {
            currentUser = null 
        }

        res.status(200).send(currentUser)

    }

    //Função para resgatar o usuário pelo ID
    static async getUserById(req, res) {

        const id = req.params.id

        const user = await User.findById(id).select("-password")

        if(!user) {
            res.status(422).json({ message: "Usuário não encontrado" })
            return
        }

        res.status(200).json({ user })

    }

    //Função para editar o usuário
    static async editUser(req, res) {

        const id = (req.params.id)

        //Checando se o usuário existe
        const token = getToken(req)
        const user = await getUserByToken(token)

        const { name, email, phone, password, confirmpassword } = req.body

        let image = ''

        //Validações
        if(!name) {
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }

        if(!email) {
            res.status(422).json({ message: 'O email é obrigatório' })
            return
        }

        //Checar se o email que está tentando atualizar já está cadastrado
        const userExists = await User.findOne({email: email})

        if (user.email !== email && userExists) {
            res.status(422).json({message: 'Utilize outro email'})
            return
        }

        user.email = email

        if(!phone) {
            res.status(422).json({ message: 'O telefone é obrigatório' })
            return
        }

        if(!password) {
            res.status(422).json({ message: 'A senha é obrigatório' })
            return
        }

        if(!confirmpassword) {
            res.status(422).json({ message: 'A confirmação da senha é obrigatório' })
            return
        }
    }
}