using System;
using API.Common;
using API.DTOs;
using API.Extentions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.EndPoints;

public static class AccountEndPoint
{
    public static RouteGroupBuilder MapAccountEndpoint(this WebApplication app)
    {
        var group = app.MapGroup("/api/account").WithTags("account");

        group.MapPost("/register", async (HttpContext context, UserManager<AppUser> userManger,
         [FromForm] string fullname, [FromForm] string email, [FromForm] string password,
         [FromForm] string username, [FromForm] IFormFile? profilePic) =>
        {
            var userFromDb = await userManger.FindByEmailAsync(email);
            if (userFromDb != null)
            {
                return Results.BadRequest(Response<string>.Failure("User already exists"));
            }

            if (profilePic is null)
            {
                    return Results.BadRequest(Response<string>.Failure("Profile picture is required"));
                
            }

            var picture = await FileUpload.Upload(profilePic);

            picture = $"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";

            var user = new AppUser
            {
                FullName = fullname,
                Email = email,
                UserName = username,
                ProfilePic = picture
            };

            var result = await userManger.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                return Results.BadRequest(Response<string>.Failure(result.Errors.Select(e => e.Description).FirstOrDefault()!));
            }

            return Results.Ok(Response<string>.Success("", "User registered successfully"));
        }).DisableAntiforgery();
        
        group.MapPost("/login", async (UserManager<AppUser> userManger,TokenService tokenService, LoginDto dto) =>
        {
            if (dto is null)
            {
                return Results.BadRequest(Response<string>.Failure("Invalid login request"));
            }

            var user = await userManger.FindByEmailAsync(dto.Email);

            if (user is null)
            {
                return Results.BadRequest(Response<string>.Failure("Invalid email or password"));
            }

            var result = await userManger.CheckPasswordAsync(user!, dto.Password);
            if (!result)
            {
                return Results.BadRequest(Response<string>.Failure("Invalid email or password"));
            }

            var token = tokenService.GenerateToken(user.Id, user.UserName!);

            return Results.Ok(Response<string>.Success(token, "Login successful"));
        });

        group.MapGet("/me" ,async (HttpContext context , UserManager<AppUser> userManger) =>
        {
            var currentLoggedInUserId = context.User.GetUserId()!;
            var user = await userManger.Users.SingleOrDefaultAsync(x=>x.Id == currentLoggedInUserId.ToString());

            return Results.Ok(Response<AppUser>.Success(user!, "User retrieved successfully"));
        }).RequireAuthorization();

        return group;
    }
}
