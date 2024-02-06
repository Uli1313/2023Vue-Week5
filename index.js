const apiUrl = "https://vue3-course-api.hexschool.io/v2";
const apiPath = "uli01";

const { Form, Field, ErrorMessage, defineRule, configure } = VeeValidate;
const { required, email, min } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule("required", required);
defineRule("email", email);
defineRule("min", min);

loadLocaleFromURL(
  "https://unpkg.com/@vee-validate/i18n@4.12.4/dist/locale/zh_TW.json"
);
configure({
  generateMessage: localize("zh_TW"),
  validateOnInput: true,
});

const userModal = {
  props: ["tempProduct", "addToCart", "status"],
  data() {
    return {
      productModal: null,
      qty: 1,
    };
  },
  methods: {
    open() {
      this.productModal.show();
    },
    close() {
      this.productModal.hide();
    },
  },
  watch: {
    tempProduct() {
      this.qty = 1;
    },
  },
  template: "#userProductModal",
  mounted() {
    this.productModal = new bootstrap.Modal(this.$refs.modal);
  },
};

const app = Vue.createApp({
  data() {
    return {
      products: [],
      tempProduct: {},
      carts: {},
      status: {
        addCartLoading: "",
        cartQtyLoading: "",
      },
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
      isLoading: true,
      dataReady: false,
    };
  },
  components: {
    userModal,
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
    loading: VueLoading.Component,
  },
  methods: {
    async getProducts() {
      const url = `${apiUrl}/api/${apiPath}/products/all`;
      try {
        const res = await axios.get(url);
        console.log(1);
        this.products = res.data.products;
      } catch (err) {
        alert(err.data.message);
      }
    },
    openModal(product) {
      this.tempProduct = product;
      this.$refs.userModal.open();
    },
    addToCart(product_id, qty = 1) {
      const url = `${apiUrl}/api/${apiPath}/cart`;
      const order = {
        product_id,
        qty,
      };
      this.status.addCartLoading = product_id;
      axios
        .post(url, { data: order })
        .then((res) => {
          this.status.addCartLoading = "";
          this.getCart();
          this.$refs.userModal.close();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    changeCartQty(item, qty = 1) {
      const url = `${apiUrl}/api/${apiPath}/cart/${item.id}`;
      const order = {
        product_id: item.product_id,
        qty,
      };
      this.status.cartQtyLoading = item.id;
      axios
        .put(url, { data: order })
        .then((res) => {
          this.status.cartQtyLoading = "";
          this.getCart();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    removeCartItem(id) {
      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      this.status.cartQtyLoading = id;
      axios
        .delete(url)
        .then((res) => {
          this.getCart();
          this.status.cartQtyLoading = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    removeCartAll() {
      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios
        .delete(url)
        .then((res) => {
          this.getCart();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    async getCart() {
      const url = `${apiUrl}/api/${apiPath}/cart`;
      try {
        const res = await axios.get(url);
        console.log(2);
        this.carts = res.data.data;
      } catch (err) {
        alert(err.data.message);
      }
    },

    submitOrder() {
      if (!this.carts.carts.length) {
        alert("購物車內沒有商品，無法送出訂單");
        return;
      }
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios
        .post(url, { data: order })
        .then((res) => {
          alert(res.data.message);
          this.$refs.form.resetForm();
          this.getCart();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
  },
  async mounted() {
    await this.getProducts();
    await this.getCart();
    console.log(3);
    this.dataReady = true;
    this.isLoading = false;
  },
});

app.mount("#app");
