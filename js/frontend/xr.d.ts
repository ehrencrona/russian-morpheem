declare module "xr" {

    class XR {
        
        get(
            url: string,
            parameters?:  { [name: string]: string },
            args?: { [name: string]: any }
        )

        del(
            url: string,
            parameters?:  { [name: string]: string },
            args?: { [name: string]: any }
        )
        
        post(
            url: string,
            data: any,
            parameters?:  { [name: string]: string },
            args?: { [name: string]: any }
        )
 
        put(
            url: string,
            data: any,
            parameters?:  { [name: string]: string },
            args?: { [name: string]: any }
        )

        configure(
            config: { [name: string]: any }
        )

   }
        
    export default new XR();
}