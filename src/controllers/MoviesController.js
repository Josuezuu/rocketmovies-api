const knex = require("../database/knex");

class MoviesController {
  async create(request, response) {
    const { title, rating, description, tags } = request.body;

    const user_id = request.user.id;

    const [movie_id] = await knex("movies").insert({
      title,
      rating,
      description,
      user_id,
    });

    const tagsInsert = tags.map((name) => ({
      movie_id,
      user_id,
      name,
    }));

    await knex("tags").insert(tagsInsert);

    return response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    const movie = await knex("movies").where({ id }).first();
    const tags = await knex("tags").where({ movie_id: id }).orderBy("name");

    return response.json({ ...movie, tags });
  }

  async delete(request, response) {
    const { id } = request.params;

    const movie = await knex("movies").where({ id }).first();

    if (!movie) {
      return response.status(404).json({ message: "Filme não encontrado." });
    }

    await knex("movies").where({ id }).delete();

    return response.json({ message: "O filme foi deletado com sucesso." });
  }

  async index(request, response) {
    const { title, tags } = request.query;

    const user_id = request.user.id;

    let movies;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());

      movies = await knex("tags")
        .select([
          "movies.id",
          "movies.title",
          "movies.description",
          "movies.rating",
          "movies.user_id",
        ])
        .where("movies.user_id", user_id)
        .whereLike("movies.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("movies", "movies.id", "tags.movie_id")
        .orderBy("movies.title");
    } else if (title) {
      movies = await knex("movies")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    } else {
      movies = await knex("movies").where({ user_id });
    }

    const userTags = await knex("tags").where({ user_id });
    const moviesWithTags = movies.map((movie) => {
      const movieTags = userTags.filter((tag) => tag.movie_id === movie.id);

      return {
        ...movie,
        tags: movieTags,
      };
    });

    return response.json(moviesWithTags);
  }
}

module.exports = MoviesController;
