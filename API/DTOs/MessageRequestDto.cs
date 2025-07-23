using System;

namespace API.DTOs;

public class MessageRequestDto
{
    public string Id { get; set; }
    public string? SenderId { get; set; }
    public string? ReceiverId { get; set; }
    public string? Content { get; set; }
    public bool IsRead { get; set; }
    public DateTime Timestamp { get; set; }
}
