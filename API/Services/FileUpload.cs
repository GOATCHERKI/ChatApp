using System;

namespace API.Services;

public class FileUpload
{
    public static async Task<string> Upload(IFormFile file)
    {
        var uploadFile = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot", "uploads");

        if (!Directory.Exists(uploadFile))
        {
            Directory.CreateDirectory(uploadFile);
        }

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadFile, fileName);
        
        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return fileName;
    }
}
