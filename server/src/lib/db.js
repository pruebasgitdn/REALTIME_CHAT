import mongoose from "mongoose";

export const connectionDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      dbName: "REALTIME_CHAT",
    });
    console.log(`Conectado exitosamente a la DB: ${conn.connection.name} ✅`);
  } catch (error) {
    console.error("Conexion MongoBD fallida:" + error);
  }
};
