#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __cplusplus
extern "C" {
#endif

char* __yttria_conv_f2s(double num) {
    char buffer[64];
    int ret = snprintf(buffer, sizeof(buffer), "%.8f", num);

    if (ret < 0)
        return "0.0";
    if (ret >= sizeof(buffer))
        return "nil";

    return strtok(buffer, "");
}

char* __yttria_conv_i2s(long num) {
    int temp = num, len = (num == 0) ? 1 : ((num < 0) ? len + 1 : len);

    while(temp != 0) {
        temp /= 10;
        len++;
    }

    char* str = (char*) malloc((len + 1) * sizeof(char));
    if(str == NULL)
        return "nil";

    if(num < 0) {
        str[0] = '-';
        num = -num;
    }
    else if (num == 0)
        str[0] = '0';

    str[len] = '\0', len--;
    while (num != 0) {
        str[len] = '0' + (num % 10);
        num /= 10;
        len--;
    }

    return str;
}

char* __yttria_concat_str(char* x, char* y) {
    char* result = (char*) malloc(
        strlen(x) +
        strlen(y) +
        1
    );

    if(result == NULL)
        return "nil";

    strcpy(result, x);
    strcat(result, y);

    return result;
}

#ifdef __cplusplus
}
#endif