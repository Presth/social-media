export default function timestamp(schema) {
     schema.add({
          createdAt: Date,
          updatedAt: Date
     });

     // Create a pre-save hook
     schema.pre('create', function (next) {
          let now = Date.now();

          this.updatedAt = now;
          // Set a value for createdAt only if it is null
          if (!this.createdAt) {
               this.createdAt = now;
          }
          // Call the next function in the pre-save chain
          next();
     });
}