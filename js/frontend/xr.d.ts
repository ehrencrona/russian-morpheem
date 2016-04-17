declare module "xr" {

    class XR {
        
        get(
            url: string,
            parameters?:  { [name: string]: string }
        )

        post(
            url: string,
            data: any,
            parameters?:  { [name: string]: string }
        )
 
        put(
            url: string,
            data: any,
            parameters?:  { [name: string]: string }
        )

   }
        
    export default new XR();
}