export interface AppError  {
    status: number,
    message: string,
    data?:  {
        extra_data? : {
            reason: string
        }
   }
}