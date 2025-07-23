using System;

namespace API.Common;

public class Response<T>
{
    public bool IsSuccess { get; }
    public string? Message { get; set; }
    public T Data { get; }
    public string Error { get; }


    public Response(bool isSuccess, T data, string? error, string? message)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
        Message = message;
    }



    public static Response<T> Success(T data, string? message = "") => new
    (true, data, null, message);
    
     public static Response<T> Failure(string error) => new Response<T>
    (false,default!, error, null);


}
