using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Text;
using System.Collections.Generic;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using TaskManagementSystem.Modules.Identity.Application.DTOs;

namespace TaskManagementSystem.Modules.Identity.Application.Services;

public class AuthService : IAuthService
{
    private readonly TaskManagementDbContext context;
    private readonly IConfiguration configuration;
    public AuthService(TaskManagementDbContext context, IConfiguration configuration)
    {
        this.context = context;
        this.configuration = configuration;
    }
    //Login---------------------------------------------------------------------------------
    public async Task<(TokenResponseDto? tokenRespone, string? error)> LoginAsync(UserDto request)
    {

        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null)
        {
            return (null, "User not found");
        }
        if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password)
            == PasswordVerificationResult.Failed)
        {
            await context.SaveChangesAsync();
            return (null, "User not found");
        }
        await context.SaveChangesAsync();
        return (await CreateTokenResponse(user), null);
    }
    //--------------------------------------------------------------------------------------

    //Change Password----------------------------------------------------------------------------------
    public async Task<(TokenResponseDto? tokenRespone, string? error)> ChangePassword(ChangePasswordDto request, int userid)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userid);
        if (user is null) return (null, "User not found");
        if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            return (null, "Current password is incorrect");

        if (string.IsNullOrEmpty(request.NewPassword) ||
           request.NewPassword.Length < 8 ||
           request.NewPassword.Length > 30 ||
           !request.NewPassword.Any(char.IsUpper) ||
           !request.NewPassword.Any(char.IsLower) ||
           !request.NewPassword.Any(char.IsDigit) ||
           !request.NewPassword.Any(ch => !char.IsLetterOrDigit(ch)))
            return (null, "Password:" +
                 "\n must be at least 8 characters long" +
                 "\n must be maximum 30 characters long" +
                 "\n must contain at least one uppercase, lowercase letter, digit and special character");
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, request.NewPassword);
        await context.SaveChangesAsync();
        return (await CreateTokenResponse(user), null);

    }
    //---------------------------------------------------------------------------------------

    //Create Token---------------------------------------------------------------
    private string CreateToken(User user)
    {
        var claims = new List<Claim> {
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Role, user.Role.ToString()),
      };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
        var tokenDescriptor = new JwtSecurityToken(
            issuer: configuration.GetValue<string>("AppSettings:Issuer"),
            audience: configuration.GetValue<string>("AppSettings:Audience"),
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
);
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }
    //Create Token---------------------------------------------------------------

    private string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(32);

        var token = Convert.ToBase64String(randomBytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
        return token;
    }

    private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
    {
        var refreshToken = GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await context.SaveChangesAsync();
        return refreshToken;
    }

    private async Task<User?> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
    {
        var user = await context.Users.FindAsync(userId);
        if (user is null || user.RefreshToken != refreshToken
            || user.RefreshTokenExpiryTime <= DateTime.UtcNow) return null;
        return user;
    }
    public async Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request)
    {
        var user = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
        if (user is null) return null;

        return await CreateTokenResponse(user);
    }

    //Token Response-------------------------------------------------------------
    //Used in both Login and Refresh TokenS methods 
    private async Task<TokenResponseDto> CreateTokenResponse(User user)
    {
        return new TokenResponseDto
        {
            AccessToken = CreateToken(user),
            RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
        };
    }
    //Token Response-------------------------------------------------------------
}