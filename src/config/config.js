
export default  {
    node_env : process.env.NODE_ENV,
    inDev : isTrue(process.env.REACT_APP_IN_DEV)
}

function isTrue(str){
    return str === "true"
}