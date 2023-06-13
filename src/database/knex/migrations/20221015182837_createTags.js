exports.up = (knex) =>
  knex.schema.createTable("tags", (table) => {
    table.increments("id");
    table
      .integer("movie_id")
      .references("id")
      .inTable("movies")
      .onDelete("CASCADE");
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("name").notNullable();
  });

exports.down = (knex) => knex.schema.dropTable("tags");
