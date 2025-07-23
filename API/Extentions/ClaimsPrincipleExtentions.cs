using System;
using System.Security.Claims;

namespace API.Extentions;

public static class ClaimsPrincipleExtentions
{
    public static string GetUserName(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Name)?.Value ?? throw new Exception("User name claim not found");
    }

    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (value == null)
            throw new Exception("User ID claim not found");
        return Guid.Parse(value);
    }
}
