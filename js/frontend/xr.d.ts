declare module "xr" {

    class XR {
        
        get(
            url: string,
            parameters?:  { [name: string]: string }
        )
    }
        
    export default new XR();
}