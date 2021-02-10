var app = new Vue({
    el: '#app',
    data: {
        message : "Hello world!",
        left : false,
        name: null,
        password: '',
        accept: false
    },
    delimiters: ['[%', '%]'],
    methods: {
    onSubmit () {
      if (this.accept !== true) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: 'You need to accept the license and terms first'
        })
      }
      else {
        console.log(this.name + this.password)
        // var request = new XMLHttpRequest();
        // request.addEventListener("load", reqListener);
        // request.open("GET", "http://www.example.org/example.txt");
        // request.send();
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Submitted'
        })
      }
    },

    onReset () {
      this.name = null
      this.age = null
      this.accept = false
    }
  }
  });
