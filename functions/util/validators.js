const isEmpty = (string)=>{
    if(string.trim() === '') return true;
    else return false;
};
const isAstring = (string)=>{
    let str = String(string);
    return str;
};
const isEmail = (email)=>{
   const regularExpression = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/ ;
       if(email.match(regularExpression)) return true;
       else return false;
};

exports.validateSignupData =(data) => {
    
let errors = {};

if(isEmpty(data.email)){
    errors.email = 'Must not be empty';
} else if(!isEmail(data.email)){
   errors.email = 'Must be a valid email address';
}
    
if(isEmpty(data.password)){
    errors.password = 'Must not be empty';
}else if(isAstring(data.password).length < 7){
    errors.password = 'Password must be more than 7 characters.';
}
if(data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must match';
if(isEmpty(data.handle)) errors.handle = 'Must not be empty';


return {
    errors,
    valid: Object.keys(errors).length === 0 ? true: false  
};

};

exports.validateLoginData = (data) =>{
    let errors = {};
    if(isEmpty(data.email)) errors.email = 'must not be empty';
    if(isEmpty(data.password)) errors.password = 'must not be empty';
    
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true: false  
    };

};

exports.reduceUserDetails = (data) =>{
    let userDetails ={};
    if(!isEmpty(data.bio.trim())) userDetails.bio = String(data.bio);
    if(!isEmpty(data.website.trim())){
        if(data.website.trim().substring(0,4) !== 'http'){
            userDetails.website = `http://${data.website.trim()}`;
        }else{
            userDetails.website = String(data.website);
        }
    }
    if(!isEmpty(data.location.trim())) userDetails.location = String(data.location);

    return userDetails; 
};