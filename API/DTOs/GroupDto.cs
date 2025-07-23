namespace API.DTOs;

public class GroupDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<string> MemberIds { get; set; }
    public string Type { get; set; } // "private" or "public"
    public List<object> Members { get; set; } // For populated user details
}
