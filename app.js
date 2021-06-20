/* Gereklilikler*/
const mysql = require('mysql');
const configMySql = require(__dirname + "/public/js/mysql-config.js");
const mysqlIslem = require(__dirname + "/public/js/mysql_classes.js");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const nocache = require('nocache'); //browser cache yok
//const request=require("request");

/*Gerekli modüllerden fonksiyonların aktarılması*/
//const getWorkDay=require(__dirname+"/public/js/dateLys.js");
const getWorkDay = require(__dirname + "/public/js/dateLys2.js");

/*express için ayarlama işlemleri*/
const app = express();
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
/*---------------------------------- */

/*global değişkenler */
//var listItems = ["Ekmek al..."];
var userObj = {
    isim: '',
    soyad: '',
    email1: '',
    email2: '',
    bultenAbne: ''
};
const listeSabitKategori = ["Günlük", "Kişisel", "Alış veriş", "Projeler"];
const listeSabitOncelik = ["Çok Önemli", "Önemli", "Normal", "Düşük"];
var listeAdlari = [];
var countBadges;
/* -------------------------------------- */

async function getlisteAdlari(kId) {

    try {
        let tableRows = await mysqlIslem.getListHeader(kId);
        let listeAdi = [];
        // console.log(tableRows);
        //  console.log(tableRows.length);
        for (let i = 0; i < tableRows.length; i++) {
            listeAdi[i] = tableRows[i].liste_adi;
        }
        return listeAdi;
    } catch (error) {
        console.log(error);
    }

}
async function getBadges() {
    let kisiselBadge = await mysqlIslem.getKisiselBadge();
    //console.log(kisiselBadge[0].kisiselSayisi);
    let gunlukBadge=await mysqlIslem.getGunlukBadge();
    let alisVerisBadge=await mysqlIslem.getAlisVerisBadge();
    let projelerBadge=await mysqlIslem.getProjelerBadge();

    return {
        kisisel: kisiselBadge[0].kisiselSayisi,
        gunluk: gunlukBadge[0].gunlukSayisi,
        alisVeris: alisVerisBadge[0].alisVerisSayisi,
        projeler: projelerBadge[0].projelerSayisi

    };
}

/* Client (browser) gelen isteklerile ilgili işlemleri*/

app.get("/", function (req, res) {
    res.render("index", {
        navgirCik: "Giriş...",
        userObj
    });
});

/*login işlemleri*/

app.post("/listeler", async function (req, res) {

    let username = req.body.kulAdi;
    let password = req.body.girisSifresi;

    if (username && password) {
        //var sql="SELECT * FROM kullanicilar WHERE 1";
        // 
        try {

            let results = await mysqlIslem.login(username, password);

            if (results.length != 0) {
                console.log("giriş başarılı....");
                req.session.loggedin = true;
                req.session.username = username;
                req.session.kid = results[0].id;

                res.Buffer = true;
                res.ExpiresAbsolute = new Date().getHours() - 1;
                res.Expires = 0;
                res.CacheControl = "no-cache";

                listeAdlari = await getlisteAdlari(req.session.kid);
                countBadges = await getBadges();
                //console.log(countBadges);
                //   console.log(listeAdlari);

                res.render("index_dash", {
                    kulAdi: results[0].kulAdi,
                    kulId: results[0].id,
                    listeAdi: listeAdlari,
                    tarih: getWorkDay.CurrentDate(),
                    badges:countBadges
                });

            } else {
                console.log("giriş hatalı ?");
                res.redirect("/"); //root a döndürür 
            }
            res.end();
        } catch (e) {
            console.log("err: " + e);
        }

    } else {
        res.send("Please enter Username and Password!");
        res.end();
    }
});

/*Kullanıcı kayıt ile ilgili işlemler*/
app.post("/signin", async function (req, res) {

    let ad = req.body.ad;
    let soyad = req.body.soyad;
    let email1 = req.body.email1;
    let email2 = req.body.email2;
    let sifre1 = req.body.sifre1;
    let sifre2 = req.body.sifre2;
    let bultenAbone = false;

    if (req.body.bultenAbone == "1")
        bultenAbone = true;

    // console.log("ad-soyad :"+ad+" "+soyad);
    // console.log("email :"+email1+" @ "+email2);
    // console.log("sifre:"+sifre1+"-"+sifre2);
    // console.log("Abone :"+bultenAbone);

    userObj = {
        isim: ad,
        soyad: soyad,
        email1: email1,
        email2: email2,
        bultenAbone: bultenAbone
    };

    try {
        if (sifre1 !== sifre2) {

            res.render("index", {
                durum: 'Hata',
                userObj
            });

            console.log("Hata...");

        } else {

            let kId = await mysqlIslem.addUser([ad + " " + soyad, email1 + "@" + email2, bultenAbone, sifre1]);

            req.session.loggedin = true;
            req.session.username = ad;

            res.Buffer = true;
            res.ExpiresAbsolute = new Date().getHours() - 1;
            res.Expires = 0;
            res.CacheControl = "no-cache";

            res.render("index_dash", {
                kulAdi: ad,
                kulId: kId
            });
            //res.redirect("/");
        }

        res.end();

    } catch (e) {
        console.log(e);

    }
}); // signin post

app.get("/cancel", (req, res) => {
    userObj = {};

    res.render("index", {
        durum: 'Ok',
        userObj
    });
});

app.get("/liste/:listeAdi", async function (req, res) {

    let listeIstek = req.params.listeAdi;
    //listeIstek = listeIstek.replace(/-/, " ");
    listeIstek = listeIstek.split("-").join(" "); //replace yerine raplaceAll gibi çalışır...
    console.log(listeIstek);

    // res.send(req.params.listeAdi);
    // res.end();

    let tableRows = await mysqlIslem.getListHeader(req.session.kid);
    let istekRow;
    //let modalAciklama=true;
    for (let i = 0; i < tableRows.length; i++) {
        if (tableRows[i].liste_adi === listeIstek)
            istekRow = tableRows[i];
    }

    var myJsonString = JSON.stringify(istekRow);

    // for (let i = 0; i < tableRows.length; i++) {
    //     listeAdlari[i] = tableRows[i].liste_adi;
    // }

    console.log(myJsonString);

    res.json(myJsonString);

    // res.render("index_dash", {
    //     kulAdi:req.session.username,
    //     kulId: req.session.kid,
    //     listeAdi: listeAdlari,
    //     tarih: getWorkDay.CurrentDate()

    // });

});

app.post("/delete", async function (req, res) {
    // let dbId = req.params.id;
    let dbId = req.body.btnSil;
    // console.log("del id:" + dbId);

    let delListe = await mysqlIslem.delListHeader(dbId);
    console.log('affected rows:' + delListe.affectedRows);
    listeAdlari = [];
    listeAdlari = await getlisteAdlari(req.session.kid);
    countBadges = await getBadges();

    res.render("index_dash", {
        kulAdi: req.session.username,
        kulId: req.session.kid,
        listeAdi: listeAdlari,
        tarih: getWorkDay.CurrentDate(),
        badges:countBadges
    });


    // if (delListe.affectedRows === 1) {   
    //    // console.log(listeAdlari);       
    // }

});

app.post("/list-insert", async function (req, res) {

    let gBaslik = req.body.gBaslik;
    let kategori = req.body.kategori;
    kategori = listeSabitKategori[Number(kategori) - 1];
    let oncelik = req.body.oncelik;
    oncelik = listeSabitOncelik[Number(oncelik) - 1];
    let aciklama = req.body.aciklama;
    let tarihZaman = req.body.tarZmn;
    tarihZaman = tarihZaman.replace("T", " ");

    console.log(gBaslik);
    console.log(kategori);
    console.log(oncelik);
    console.log(aciklama);
    console.log(tarihZaman);
    console.log("KulId:" + req.session.kid);

    let kId = await mysqlIslem.addNewList([req.session.kid, gBaslik, kategori, tarihZaman, oncelik, aciklama]);
    listeAdlari = await getlisteAdlari(req.session.kid);
    countBadges = await getBadges();

    res.render("index_dash", {
        kulAdi: req.session.username,
        kulId: req.session.kid,
        listeAdi: listeAdlari,
        tarih: getWorkDay.CurrentDate(),
        badges:countBadges
    });

});

app.get("/logout", function (req, res) {

    req.session.loggedin = false;
    req.session.username = null;
    req.session.destroy(null);
    userObj = {};

    res.render("index", {
        durum: 'Ok',
        userObj
    });
    //res.redirect("/");
});
/* ---------------------------------------------------------*/

/* Server kurulumu  */
app.listen(process.env.PORT || 3000, function () {
    console.log("todo list server running on port 3000");
});


/******  KALDIRILMIŞ işlemler           ******/
// try {
//     var sql = "SELECT * FROM kullanicilar WHERE kulAdi = ? AND sifre = ?";
//     con.query(sql, [username, password], function (err, results) {
//         // console.log("result:"+ results.length);
//         // console.log("err:"+ err);
//         if (err) throw err; //throw ifadesi, kullanıcı tanımlı bir istisna atar. 
//                             //Mevcut fonksiyonun yürütülmesi duracaktır 
//                             //(atmadan sonraki ifadeler çalıştırılmayacaktır) ve 
//                             //kontrol, çağrı yığınındaki ilk catch bloğuna geçirilecektir.
//         if (results.length == 0) {
//             // response.send("Yanlış giriş !");
//             // response.send('<script>alert("Hello")</script>');
//             // response.render("index", {
//             //     durum: "Hata"
//             // }); //login.ejs sayfasını gönderir browser a

//             res.redirect("/");      //root a döndürür                             
//         } else {
//             //response.send('kul:' + results[0].kulAdi);
//             //console.log("Result: " + results[0].kulAdi);
//             req.session.loggedin = true;
//             req.session.username = username;
//             req.session.id=results[0].id;
//             // response.sendFile(path.join(__dirname + '/home.html'));

//             res.Buffer = true;  
//             res.ExpiresAbsolute = new Date().getHours()-1;  
//             res.Expires = 0;  
//             res.CacheControl = "no-cache"; 

//             res.render("index_dash", {
//                 kulAdi: results[0].kulAdi,
//                 kulId: results[0].id
//             });
//         }
//         res.end();
//     });

//     con.end(function (err) {
//         if (err) {
//             console.log("Error ending the connection:", err);
//         }
//         //  reconnect in order to prevent the"Cannot enqueue Handshake after invoking quit"
//         con=mysql.createConnection(configMySql);
//     });

// } catch (e) {
//     console.log(e);

//     con.end(function (err) {
//         if (err) {
//             console.log("Error ending the connection:", err);
//         }
//         //  reconnect in order to prevent the"Cannot enqueue Handshake after invoking quit"
//         con=mysql.createConnection(configMySql);
//     });

// }


// list.ejs 
// app.get("/list", function (req, res) {
//     const day=getWorkDay.CurrentDate();
//     // const templateData = {
//     //     kindOfDay: day,
//     //     list: listItems,
//     //     navgirCik:"Çıkış..."
//     // };
//     // res.render("list", templateData);
//     res.render("index_dash");

// });/*login işlemleri*/

// app.post("/list",function(req,res){

//     listItems.push(req.body.itemName);
//     res.redirect("/list");

// });



// app.get("/",function(req,res){

//     const day=getWorkDay.CurrentDate();
//     //const day=getWorkDay.CurrentDay(); //2. fonksiyon kullanımı

//     const templateData={
//         kindOfDay:day,
//         list:listItems
//     };
//     res.render("list",templateData);

// });






//<!--  -->