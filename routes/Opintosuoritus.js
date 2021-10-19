var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');
 
// display books page
router.get('/', function(req, res, next) {
      
    dbConn.query('SELECT * FROM opiskelija join arvionti on opiskelija.idOpiskelija = arvionti.idOpiskelija join opintojakso on arvionti.idOpintojakso = opintojakso.idOpintojakso where opiskelija.idOpiskelija = arvionti.idOpiskelija and opintojakso.idOpintojakso = arvionti.idOpintojakso ORDER BY Paivamaara desc',function(err,rows)     {
 
        if(err) {
            req.flash('error', err);
            // render to views/books/index.ejs
            res.render('opintosuoritus',{data:''});   
        } else {
            // render to views/books/index.ejs
            res.render('opintosuoritus',{data:rows});
        }
    });
});

// display add book page
router.get('/add', function(req, res, next) {    
    // render to add.ejs
    res.render('opintosuoritus/add', {
        Paivamaara: '',
        Arvosana: '',
        idOpiskelija: '',
        idOpintojakso: ''
    })
})

// add a new book
router.post('/add', function(req, res, next) {    

    let Paivamaara = req.body.Paivamaara;
    let Arvosana = req.body.Arvosana;
    let idOpiskelija = req.body.idOpiskelija;
    let idOpintojakso = req.body.idOpintojakso;
    let errors = false;

    if(idOpiskelija.length === 0 || idOpintojakso.length === 0 || Arvosana.length === 0 || Paivamaara.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter nimi, opintojakso, arvio and päivämäärä");
        // render to add.ejs with flash message
        res.render('opintosuoritus/add', {
            Paivamaara: Paivamaara,
            Arvosana: Arvosana,
            idOpiskelija: idOpiskelija,
            idOpintojakso: idOpintojakso
        })
    }

    // if no error
    if(!errors) {

        var form_data = {
            Paivamaara: Paivamaara,
            Arvosana: Arvosana,
            idOpiskelija: idOpiskelija,
            idOpintojakso: idOpintojakso
        }
        // insert query
        dbConn.query('INSERT INTO arvionti SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                            
                // render to add.ejs
                res.render('opintosuoritus/add', {
                    Paivamaara: form_data.Paivamaara,
                    Arvosana: form_data.Arvosana,
                    idOpiskelija: form_data.idOpiskelija,
                    idOpintojakso: form_data.idOpintojakso
                })
            } else {                
                req.flash('success', 'Opintosuoritus successfully added');
                res.redirect('/opintosuoritus');
            }
        })
    }
})

// display edit book page
router.get('/edit/(:idArvionti)', function(req, res, next) {

    let idArvionti = req.params.idArvionti;
   
    dbConn.query('SELECT * FROM arvionti WHERE idArvionti = '+ idArvionti, function(err, rows, fields) {
        if(err) throw err
         
        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Opintosuoritus not found with idArvionti = ' + idArvionti)
            res.redirect('/opintosuoritus')
        }
        // if book found
        else {
            // render to edit.ejs
            res.render('opintosuoritus/edit', {
                title: 'Edit Opintosuoritus', 
                idArvionti: rows[0].idArvionti,
                Paivamaara: rows[0].Paivamaara,
                Arvosana: rows[0].Arvosana,
                idOpiskelija: rows[0].idOpiskelija,
                idOpintojakso: rows[0].idOpintojakso
            })
        }
    })
})

// update book data
router.post('/update/:idArvionti', function(req, res, next) {

    let idArvionti = req.params.idArvionti;
    let Paivamaara = req.body.Paivamaara;
    let Arvosana = req.body.Arvosana;
    let idOpiskelija = req.body.idOpiskelija;
    let idOpintojakso = req.body.idOpintojakso;
    let errors = false;

    if(idOpiskelija.length === 0 || idOpintojakso.length === 0 || Arvosana.length === 0 || Paivamaara.length === 0) {
        errors = true;
        
        // set flash message
        req.flash('error', "Please enter nimi, opintojakso, arvio and päivämäärä");
        // render to add.ejs with flash message
        res.render('opintosuoritus/edit', {
            idArvionti: req.params.idArvionti,
            Paivamaara: Paivamaara,
            Arvosana: Arvosana,
            idOpiskelija: idOpiskelija,
            idOpintojakso: idOpintojakso
        })
    }

    // if no error
    if( !errors ) {   
 
        var form_data = {
            Paivamaara: Paivamaara,
            Arvosana: Arvosana,
            idOpiskelija: idOpiskelija,
            idOpintojakso: idOpintojakso
        }
        // update query
        dbConn.query('UPDATE arvionti set ? where idArvionti = ' + idArvionti, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('opintosuoritus/edit', {
                    idArvionti: req.params.idArvionti,
                    Paivamaara: form_data.Paivamaara,
                    Arvosana: form_data.Arvosana,
                    idOpiskelija: form_data.idOpiskelija,
                    idOpintojakso: form_data.idOpintojakso
                })
            } else {
                req.flash('success', 'Opintosuoritus successfully updated');
                res.redirect('/opintosuoritus');
            }
        })
    }
})
   
// delete book
router.get('/delete/(:idArvionti)', function(req, res, next) {

    let idArvionti = req.params.idArvionti;

    dbConn.query('DELETE FROM arvionti WHERE idArvionti = ' + idArvionti, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to books page
            res.redirect('/opintosuoritus')
        } else {
            // set flash message
            req.flash('success', 'Opintosuoritus successfully deleted! ID = ' + idArvionti)
            // redirect to books page
            res.redirect('/opintosuoritus')
        }
    })
})

module.exports = router;