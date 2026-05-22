using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Application.DTOs
{
    public class TokenResponseDto
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}
