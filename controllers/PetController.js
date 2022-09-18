const Pet = require('../models/Pet')

module.exports = class PetController {

    //Criar um pet
    static async create(req, res) {
        res.json({message: 'Deu certo!'})
    }

}