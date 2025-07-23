using System;
using Microsoft.AspNetCore.Identity;

namespace API.Models;

public class AppUser : IdentityUser 
{
    public String? FullName { get; set; }
    public String? ProfilePic { get; set; }

}
