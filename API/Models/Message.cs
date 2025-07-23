using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace API.Models;

public class Message
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } 
    
    public string? SenderId { get; set; }
    public string? ReceiverId { get; set; }
    public string? Content { get; set; }
    
    public DateTime Timestamp { get; set; }
    
    public bool IsRead { get; set; }
    public bool IsDeleted { get; set; } // Soft delete flag
}
