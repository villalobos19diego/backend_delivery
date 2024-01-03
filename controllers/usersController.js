const User = require('../models/user');
const Rol = require('../models/rol');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const storage = require('../utils/cloud_storage');

module.exports = {

    findDeliveryMen(req, res) {
        User.findDeliveryMen((err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con al listar los repartidores',
                    error: err
                });
            }

            
            return res.status(201).json(data);
        });
    },

    login(req, res) {

        const email = req.body.email;
        const password = req.body.password;

        User.findByEmail(email, async (err, myUser) => {
            
            console.log('Error ', err);

            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                });
            }

            if (!myUser) {
                return res.status(401).json({ // EL CLIENTE NO TIENE AUTORIZACION PARTA REALIZAR ESTA PETICION (401)
                    success: false,
                    message: 'El email no fue encontrado'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, myUser.password);

            if (isPasswordValid) {
                const token = jwt.sign({id: myUser.id, email: myUser.email}, keys.secretOrKey, {});

                const data = {
                    id: `${myUser.id}`,
                    name: myUser.name,
                    lastname: myUser.lastname,
                    email: myUser.email,
                    phone: myUser.phone,
                    image: myUser.image,
                    session_token: `JWT ${token}`,
                    roles: JSON.parse(myUser.roles)
                }

                return res.status(201).json({
                    success: true,
                    message: 'El usuario fue autenticado',
                    data: data // EL ID DEL NUEVO USUARIO QUE SE REGISTRO
                });

            }
            else {
                return res.status(401).json({ // EL CLIENTE NO TIENE AUTORIZACION PARTA REALIZAR ESTA PETICION (401)
                    success: false,
                    message: 'El password es incorrecto'
                });
            }

        });

    },

    register(req, res) {

        const user = req.body; // CAPTURO LOS DATOS QUE ME ENVIE EL CLIENTE
        User.create(user, (err, data) => {

            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                });
            }

            return res.status(201).json({
                success: true,
                message: 'El registro se realizo correctamente',
                data: data // EL ID DEL NUEVO USUARIO QUE SE REGISTRO
            });

        });

    },
    async registerWithImage(req, res) {

        const user = JSON.parse(req.body.user); // CAPTURO LOS DATOS QUE ME ENVIE EL CLIENTE

        const files = req.files;

        if (files.length > 0) {
            const path = `image_${Date.now()}`;
            const url = await storage(files[0], path);

            if (url != undefined && url != null) {
                user.image = url;
            }
        }

        User.create(user, (err, data) => {

        
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                });
            }

        
            user.id = `${data}`;
            const token = jwt.sign({id: user.id, email: user.email}, keys.secretOrKey, {});
            user.session_token = `JWT ${token}`;

            Rol.create(user.id, 3, (err, data) => {
                
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del rol de usuario',
                        error: err
                    });
                }
                
                return res.status(201).json({
                    success: true,
                    message: 'El registro se realizo correctamente',
                    data: user
                });

            });

           

        });

    },

    async updateWithImage(req, res) {

        const user = JSON.parse(req.body.user); // CAPTURO LOS DATOS QUE ME ENVIE EL CLIENTE

        const files = req.files;

        if (files.length > 0) {
            const path = `image_${Date.now()}`;
            const url = await storage(files[0], path);

            if (url != undefined && url != null) {
                user.image = url;
            }
        }

        User.update(user, (err, data) => {

            
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                });
            }

            User.findById(data, (err, myData) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del usuario',
                        error: err
                    });
                }
                
                myData.session_token = user.session_token;
                myData.roles = JSON.parse(myData.roles);

                return res.status(201).json({
                    success: true,
                    message: 'El usuario se actualizo correctamente',
                    data: myData
                });
            })
        });

    },

    async updateWithoutImage(req, res) {

        const user = req.body; // CAPTURO LOS DATOS QUE ME ENVIE EL CLIENTE

        User.updateWithoutImage(user, (err, data) => {

        
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuario',
                    error: err
                });
            }

            User.findById(data, (err, myData) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del usuario',
                        error: err
                    });
                }
                
                myData.session_token = user.session_token;
                myData.roles = JSON.parse(myData.roles);

                return res.status(201).json({
                    success: true,
                    message: 'El usuario se actualizo correctamente',
                    data: myData
                });
            })

            
        });

    },
    
    
    async updateNotificationToken(req, res) {

        const id = req.body.id; 
        const token = req.body.token; 

        User.updateNotificationToken(id, token, (err, id_user) => {

        
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error actualizando el token de notificaciones del usuario',
                    error: err
                });
            }

            return res.status(201).json({
                success: true,
                message: 'El token se actualizo correctamente',
                data: id_user
            });
            
        });

    },

}