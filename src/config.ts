export const readConfig = () => {
    return {
        db: {
            url: process.env.DB_URL || "postgres://postgres:postgres@localhost:5432/webhook?sslmode=disable",
        },
    };
}

export default readConfig;

