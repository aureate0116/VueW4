const apiUrl = "https://vue3-course-api.hexschool.io/v2";
const path = "rena";

let productModal = null;
let delProductModal = null;

import pagination from "./pagination.js";

const { createApp } = Vue;
const app = createApp({
  data(){
    return{
      products:[],
      isNew : true,  //因為新增跟編輯用同個 modal, 所以要判斷是哪個動作(新增/編輯) 決定是否帶資料進去
      tempProduct :{  
        // Modal 的內的產品資訊
        // 新增: 預設為空
        // 編輯: 帶入該產品內容
        imagesUrl: [],
      },
      page:{} //用變數決定現在要帶第幾頁
    }
  },
  methods: {
      checkAdmin(){
          axios.post(`${apiUrl}/api/user/check`)
          .then(res=>{
              this.getProduct();
          }).catch(err=>{
              alert(err.data.message);
              window.location = 'login.html';
          })
      },
      getProduct( page = 1 ){ //預設參數 ES6 的寫法
        axios.get(`${apiUrl}/api/${path}/admin/products?page=${page}`)
            .then(res=>{
                this.products = res.data.products;
                this.page = res.data.pagination;
                //console.log(this.products);
                console.log(this.page);
                console.log(res.data);
            }).catch(err=>{
                alert(err.data.message);
            })
      },
      openModal(type,product){
        if(type==="new"){
          this.isNew = true;
          this.tempProduct = {   
            //如果先開啟編輯，再新增，this.tempProduct 會帶到資料，所以這個動作意思是要先清空欄位
            imagesUrl: [],
          };
          productModal.show();
          
        }else if(type==="del"){
          this.tempProduct = {...product}; // 避免位儲存改到原本的值
          delProductModal.show();
          
        }else if(type==="edit"){
          this.isNew = false;
          this.tempProduct = {...product};
          productModal.show();
        } 
      
      },
      newOrEditProduct(){
        //console.log(this.tempProduct);
        if(this.isNew){
          axios.post(`${apiUrl}/api/${path}/admin/product`,{
            data:this.tempProduct
          }).then(res=>{
            alert(res.data.message);
            productModal.hide();
            this.getProduct();
          }).catch(err=>{
            alert(err.data.message);
          })
        }else{
          axios.put(`${apiUrl}/api/${path}/admin/product/${this.tempProduct.id}`,{
            data:this.tempProduct
          }).then(res=>{
            alert(res.data.message);
            productModal.hide();
            this.getProduct();
          }).catch(err=>{
            //alert(err.response.data.message);
            alert(err.data.message);
          })
        }
        //post & put 帶入的資料一致， 差別是post/put & 有沒有帶id
        // let method = 'post';
        // let url=``;
        // if(!this.isNew){
        //   method = 'put';
        //   url=``
        // }
        // axios[method](url,{data:this.tempProduct}).then(res=>{
        //   alert(res.data.message);
        //   productModal.hide();
        //   this.getProduct();
        // }).catch(err=>{
        //   alert(err.response.data.message);
        // })


      },
      deleteProduct(){
        axios.delete(`${apiUrl}/api/${path}/admin/product/${this.tempProduct.id}`).then(res=>{
          alert(res.data.message);
          delProductModal.hide();
          this.getProduct();
        }).catch(err=>{
          alert(err.data.message);
        })
      },
      createImgs(){ 
        //只有一張主圖時，不會有 imagesUrl，要新增一組空的，才能往下新增其他照片
        this.tempProduct.imagesUrl = [];
        this.tempProduct.imagesUrl.push('');
      }
  },
  components:{
    pagination
  },
  mounted() {
     //取得token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)userToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;
    this.checkAdmin();
    //btn 新增產品
    productModal = new bootstrap.Modal(document.getElementById("productModal"));
    //btn 刪除產品
    delProductModal = new bootstrap.Modal(document.getElementById("delProductModal"));
  },

})

// Vue.createApp(app).component('product-modal',{
//   props:['tempProduct'],
//   template:'#product-modal-template',
// })

// Vue.createApp(app).mount("#app");

//元件需要在 createApp 後，mount 前進行定義
app.component('product-modal',{
  props:['tempProduct','newOrEditProduct'],
  template:'#product-modal-template',
})
app.component('product-modal-delete',{
  props:['tempProduct','deleteProduct'],
  template:'#product-modal-delete-template',
})
app.mount('#app');