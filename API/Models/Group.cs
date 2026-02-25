using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Group
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Name { get; set; }
    public List<string> MemberIds { get; set; }
    public string Type { get; set; } // "private" or "public"
}