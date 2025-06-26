export default (fn) => {
    return (req, res, next) => {
        fn(req, res, next)
        .catch((err) => {
            throw new Error(err);
        });
    };
}