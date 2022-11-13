const notFound= (req, res, next)=>{
    const error= new Error(`Not FOUND - ${req.originalUrl}`);
    res.status(404);
    next(error);    
}

const errorHandling = (error, req, res, next)=>{
    console.log(error);
    res.status(500).send({
        message: "Something is wrong"
    });
}

module.exports= { notFound, errorHandling };