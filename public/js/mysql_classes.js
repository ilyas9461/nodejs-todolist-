
const db = require('./mysql-config');

class MySqlDBClass {

    // ==== CORE FUNCTION : Değiştirilmeyecek olan ana fonksiyonlar.
    // Yardımcı fonksiyonlar işlemlerini bu fonksiyonlar ile yaparlar.
    // Promise yapısını kullanarak asenkron (sıralı işlemler)işlem yapısını 
    // oluştururlar.
    static doQuery(queryToDo) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = queryToDo;
                db.query(query, (err, result) => {
                    
                    if (err) reject(err);
                    else resolve(result);
                });
            } catch (err) {
                console.log(err);
                reject(err);
            }

        });
    }

    static doInsert(queryToDo, array) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = queryToDo;
                db.query(query, array, function (err, result) {
                    
                    if (err) console.log(err); 
                    else resolve(result);
                });
            } catch (err) {
                console.log(err);
                reject(err);
            }
         });
    }
    //  ===== core =====

    // === Yardımcı Fonksiyonlar: Amaca uygun sorguları yürütürler  =================

    /** Bu fonksiyonlar çağrıldıkları yerde await ifadesi ile çağrılmalı ve çağıran 
     * fonksiyonunda (get, post istek işleme callback fonksiyonu) async öneki alması gerekir.
     */
    static login(kAdi, sifre) {
        //const query = "SELECT * FROM users WHERE pseudo = '" + pseudo + "' AND password = '" + password + "'";
        const query ="SELECT * FROM kullanicilar WHERE kulAdi ='"+ kAdi+"' AND sifre='"+sifre+"'";
        return this.doQuery(query);
    }

    static addUser(userInfos) { //Dizi şeklinde kaydedilecek bilgiler çağrıldığı yerde girilir.
                                //sorgudaki soru işareti sıralamasına göre veriler diziye yerleştirilmelidir.
        let query = "INSERT INTO kullanicilar(id, kulAdi, email, bulten, sifre) VALUES (NULL, ?, ?, ?, ?)"; 
        let insertedQuery = this.doInsert(query, userInfos);
        return insertedQuery.then((r, e) => {
            let iduser = r.insertId;
            return iduser;
        //   let queryClasse = "INSERT INTO dansclasse(iduser, idclasse) VALUES (?, ?)";
        //   return this.doInsert(queryClasse, [iduser, classe]);
        });
    }

    static addNewList(listInfos){
        let query="INSERT INTO listeler(id, kul_id, liste_adi, kategori, tarih, oncelik, aciklama) VALUES (NULL, ?, ?, ?, ?, ?, ?)"; 
        let insertedQuery = this.doInsert(query, listInfos);
        return insertedQuery.then((r, e) => {
            let idlist = r.insertId;
            return idlist;
        });
    }
    static getListHeader(kulId){
        const query="SELECT * FROM listeler WHERE kul_id="+kulId; 
        return this.doQuery(query);
    }

    static getKisiselBadge(){
        let query="SELECT COUNT(id) As kisiselSayisi From listeler WHERE kategori='Kişisel'";
        return this.doQuery(query);
    }    
    static getGunlukBadge(){
        let query="SELECT COUNT(id) As gunlukSayisi From listeler WHERE kategori='Günlük'";
        return this.doQuery(query);
    } 
    static getAlisVerisBadge(){
        let query="SELECT COUNT(id) As alisVerisSayisi From listeler WHERE kategori='Alış veriş'";
        return this.doQuery(query);
    }
    static getProjelerBadge(){
        let query="SELECT COUNT(id) As projelerSayisi From listeler WHERE kategori='Projeler'";
        return this.doQuery(query);
    } 
   
    static delListHeader(delId){
        const query="DELETE FROM `listeler` WHERE id="+delId; 
        return this.doQuery(query);
    }
    
    //  ==== Yardımcı Fonksiyonlar  ====

}//class

module.exports = MySqlDBClass;