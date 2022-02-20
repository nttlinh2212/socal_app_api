import Ajv from 'ajv'

const validate = (schema)=>{
    return (req,res,next)=>{
        const ajv = new Ajv();
        const valid = ajv.validate(schema,req.body);
        if(!valid){
            return res.status(400).json({
                message: ajv.errors[0].message
            })
        }
        next();
    }

}
export default validate;