import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('books.db');

// ===============================
// CREAR TABLA LIBROS
// ===============================
export const createTables = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS libros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        genre TEXT,
        format TEXT,
        cover TEXT,
        stars TEXT,
        tears TEXT,
        spicy TEXT,
        startDate TEXT,
        endDate TEXT,
        synopsis TEXT,
        mainCharacters TEXT,
        favoriteCharacters TEXT,
        hatedCharacters TEXT,
        favoriteScene TEXT,
        favoriteQuotes TEXT,
        song TEXT
      );
    `);
    console.log("Tabla libros creada correctamente");
  } catch (error) {
    console.log("Error creando tablas:", error);
  }
};

// ===============================
// CREAR TABLA USERS
// ===============================
export const createUserTable = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        password TEXT,
        username TEXT,
        bio TEXT,
        image TEXT
      );
    `);

    try { await db.execAsync(`ALTER TABLE users ADD COLUMN bio TEXT;`); } catch {}
    try { await db.execAsync(`ALTER TABLE users ADD COLUMN image TEXT;`); } catch {}

    console.log("Tabla users creada correctamente");
  } catch (error) {
    console.log("Error creando tabla users:", error);
  }
};

// ===============================
// INSERTAR LIBRO
// ===============================
export const insertBook = (book: any) => {
  try {
    db.runSync(
      `INSERT INTO libros (
        title, author, genre, format, cover,
        stars, tears, spicy,
        startDate, endDate,
        synopsis,
        mainCharacters, favoriteCharacters, hatedCharacters,
        favoriteScene, favoriteQuotes, song
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.title,
        book.author,
        book.genre,
        book.format,
        book.cover,
        JSON.stringify(book.stars || []),
        JSON.stringify(book.tears || []),
        JSON.stringify(book.spicy || []),
        book.startDate ? new Date(book.startDate).toISOString() : null,
        book.endDate   ? new Date(book.endDate).toISOString()   : null,
        book.synopsis || "",
        JSON.stringify(book.mainCharacters || []),
        JSON.stringify(book.favoriteCharacters || []),
        JSON.stringify(book.hatedCharacters || []),
        book.favoriteScene || "",
        JSON.stringify(book.favoriteQuotes || []),
        book.song || ""
      ]
    );
    console.log("Libro insertado correctamente");
  } catch (error) {
    console.log("Error al insertar libro:", error);
  }
};

// ===============================
// OBTENER LIBROS
// ===============================
export const getBooks = () => {
  try {
    const result = db.getAllSync("SELECT * FROM libros");
    return result.map((book: any) => parseBook(book));
  } catch (error) {
    console.log("Error al obtener libros:", error);
    return [];
  }
};

// ===============================
// OBTENER UN LIBRO POR ID
// ===============================
export const getBookById = (id: number) => {
  try {
    const result = db.getAllSync("SELECT * FROM libros WHERE id = ?", [id]);
    if (result.length === 0) return null;
    return parseBook(result[0] as any);
  } catch (error) {
    console.log("Error al obtener libro por id:", error);
    return null;
  }
};

// ===============================
// ACTUALIZAR LIBRO
// ===============================
export const updateBook = (book: any) => {
  try {
    db.runSync(
      `UPDATE libros SET 
        title=?, author=?, genre=?, format=?, cover=?,
        stars=?, tears=?, spicy=?,
        startDate=?, endDate=?,
        synopsis=?,
        mainCharacters=?, favoriteCharacters=?, hatedCharacters=?,
        favoriteScene=?, favoriteQuotes=?, song=?
      WHERE id=?`,
      [
        book.title,
        book.author,
        book.genre,
        book.format,
        book.cover,
        JSON.stringify(book.stars || []),
        JSON.stringify(book.tears || []),
        JSON.stringify(book.spicy || []),
        book.startDate ? new Date(book.startDate).toISOString() : null,
        book.endDate   ? new Date(book.endDate).toISOString()   : null,
        book.synopsis || "",
        JSON.stringify(book.mainCharacters || []),
        JSON.stringify(book.favoriteCharacters || []),
        JSON.stringify(book.hatedCharacters || []),
        book.favoriteScene || "",
        JSON.stringify(book.favoriteQuotes || []),
        book.song || "",
        book.id
      ]
    );
    console.log("Libro actualizado");
  } catch (error) {
    console.log("Error al actualizar:", error);
  }
};

// ===============================
// ELIMINAR LIBRO
// ===============================
export const deleteBook = (id: number) => {
  try {
    db.runSync(`DELETE FROM libros WHERE id=?`, [id]);
    console.log("Libro eliminado");
  } catch (error) {
    console.log("Error al eliminar:", error);
  }
};

// ===============================
// PARSEAR LIBRO (helper interno)
// ===============================
const parseBook = (book: any) => ({
  ...book,
  stars:              safeParse(book.stars),
  tears:              safeParse(book.tears),
  spicy:              safeParse(book.spicy),
  mainCharacters:     safeParse(book.mainCharacters),
  favoriteCharacters: safeParse(book.favoriteCharacters),
  hatedCharacters:    safeParse(book.hatedCharacters),
  favoriteQuotes:     safeParse(book.favoriteQuotes),
});

// ===============================
// FUNCIÓN SEGURA PARA JSON
// ===============================
const safeParse = (data: string) => {
  try {
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
};

// ===============================
// USUARIO
// ===============================
export interface User {
  id: number;
  username: string;
  bio: string;
  image: string | null;
  password: string;
}

interface UpdateUserParams {
  id: number;
  username: string;
  bio: string;
  image: string | null;
}

export const insertUser = async (user: any) => {
  try {
    await db.runAsync(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [user.username, user.email, user.password]
    );
  } catch (error) {
    console.log("Error insertUser:", error);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const result = await db.getFirstAsync(
      `SELECT * FROM users WHERE email = ? AND password = ?`,
      [email, password]
    );
    return result;
  } catch (error) {
    console.log("Error loginUser:", error);
    return null;
  }
};

export const updateUser = async ({ id, username, bio, image }: UpdateUserParams) => {
  await db.runAsync(
    'UPDATE users SET username = ?, bio = ?, image = ? WHERE id = ?',
    [username, bio, image, id]
  );
};

export const getUser = async () => {
  return await db.getFirstAsync('SELECT * FROM users LIMIT 1');
};

// ===============================
// CAMBIAR CONTRASEÑA
// ===============================
export const updatePassword = async (id: number, newPassword: string) => {
  try {
    await db.runAsync(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, id]
    );
    return true;
  } catch (error) {
    console.log("Error updatePassword:", error);
    return false;
  }
};

// ===============================
// ESTADÍSTICAS DE LIBROS
// ===============================
export const getBookStats = () => {
  try {
    // Total de libros
    const totalResult = db.getAllSync("SELECT COUNT(*) as total FROM libros") as any[];
    const totalBooks = totalResult[0]?.total || 0;

    // Todos los libros para calcular promedio y género
    const books = db.getAllSync("SELECT stars, genre, endDate FROM libros") as any[];

    // Promedio de estrellas
    let totalStars = 0;
    let ratedBooks = 0;

    books.forEach((book: any) => {
      try {
        const stars = JSON.parse(book.stars || "[]");
        if (stars.length > 0) {
          totalStars += stars.length;
          ratedBooks++;
        }
      } catch {}
    });

    const averageRating = ratedBooks > 0
      ? parseFloat((totalStars / ratedBooks).toFixed(1))
      : 0;

    // Libros terminados este mes
    const now = new Date();
    const booksThisMonth = books.filter((book: any) => {
      if (!book.endDate) return false;
      try {
        const end = new Date(book.endDate);
        return (
          end.getMonth() === now.getMonth() &&
          end.getFullYear() === now.getFullYear()
        );
      } catch {
        return false;
      }
    }).length;

    // Género favorito (el más repetido)
    const genreCount: Record<string, number> = {};
    books.forEach((book: any) => {
      if (book.genre) {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
      }
    });

    const favoriteGenre = Object.keys(genreCount).length > 0
      ? Object.keys(genreCount).reduce((a, b) =>
          genreCount[a] > genreCount[b] ? a : b
        )
      : "—";

    return { totalBooks, averageRating, booksThisMonth, favoriteGenre };

  } catch (error) {
    console.log("Error getBookStats:", error);
    return { totalBooks: 0, averageRating: 0, booksThisMonth: 0, favoriteGenre: "—" };
  }
};

// ===============================
// ELIMINAR USUARIO Y SUS LIBROS
// ===============================
export const deleteUser = async () => {
  try {
    await db.execAsync(`DELETE FROM users;`);
    await db.execAsync(`DELETE FROM libros;`);
    console.log("Cuenta y libros eliminados");
  } catch (error) {
    console.log("Error deleteUser:", error);
    throw error; // lo relanzamos para que Ajustes muestre el Alert de error
  }
};